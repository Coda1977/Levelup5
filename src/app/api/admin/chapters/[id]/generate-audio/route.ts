import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase-client';
import OpenAI from 'openai';
import { prepareTextForTTS, chunkTextForTTS } from '@/lib/tts-helper';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Helper function to check admin access
async function checkAdminAccess(supabase: any) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { authorized: false, error: 'Unauthorized', status: 401 };
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    return { authorized: false, error: 'Forbidden - Admin access required', status: 403 };
  }

  return { authorized: true, user };
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient(request as any);
  const svc = createServiceSupabaseClient();

  // Check admin access
  const accessCheck = await checkAdminAccess(supabase);
  if (!accessCheck.authorized) {
    return NextResponse.json(
      { error: accessCheck.error },
      { status: accessCheck.status }
    );
  }

  const chapterId = params.id;

  try {
    // Fetch chapter content
    const { data: chapter, error: fetchError } = await svc
      .from('chapters')
      .select('id, title, content')
      .eq('id', chapterId)
      .single();

    if (fetchError || !chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    if (!chapter.content) {
      return NextResponse.json(
        { error: 'Chapter has no content to convert to audio' },
        { status: 400 }
      );
    }

    // Prepare text for TTS
    const cleanText = prepareTextForTTS(chapter.content);
    
    if (!cleanText || cleanText.length < 10) {
      return NextResponse.json(
        { error: 'Chapter content is too short or empty after processing' },
        { status: 400 }
      );
    }

    console.log(`Generating TTS for chapter ${chapterId}, text length: ${cleanText.length}`);

    // Check if text needs chunking
    const chunks = chunkTextForTTS(cleanText);
    console.log(`Text split into ${chunks.length} chunk(s)`);

    // Generate audio for each chunk
    const audioBuffers: Buffer[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Generating audio for chunk ${i + 1}/${chunks.length}`);
      
      const mp3Response = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'nova', // Warm, professional female voice
        input: chunks[i],
        speed: 1.0,
      });

      const buffer = Buffer.from(await mp3Response.arrayBuffer());
      audioBuffers.push(buffer);
    }

    // Combine audio buffers if multiple chunks
    const finalAudioBuffer = audioBuffers.length === 1
      ? audioBuffers[0]
      : Buffer.concat(audioBuffers as any);

    // Upload to Supabase Storage
    const fileName = `chapter-${chapterId}.mp3`;
    const filePath = `audio/${fileName}`;

    // Delete old audio if exists
    const { data: existingFiles } = await svc.storage
      .from('chapter-audio')
      .list('audio', {
        search: `chapter-${chapterId}`,
      });

    if (existingFiles && existingFiles.length > 0) {
      await svc.storage
        .from('chapter-audio')
        .remove([filePath]);
    }

    // Upload new audio
    const { data: uploadData, error: uploadError } = await svc.storage
      .from('chapter-audio')
      .upload(filePath, finalAudioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading audio:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload audio file', details: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = svc.storage
      .from('chapter-audio')
      .getPublicUrl(filePath);

    const audioUrl = urlData.publicUrl;

    // Update chapter with audio URL
    const { error: updateError } = await svc
      .from('chapters')
      .update({ audio_url: audioUrl })
      .eq('id', chapterId);

    if (updateError) {
      console.error('Error updating chapter with audio URL:', updateError);
      return NextResponse.json(
        { error: 'Failed to update chapter with audio URL' },
        { status: 500 }
      );
    }

    console.log(`Successfully generated audio for chapter ${chapterId}`);

    return NextResponse.json({
      success: true,
      audioUrl,
      textLength: cleanText.length,
      chunks: chunks.length,
    });
  } catch (error: any) {
    console.error('TTS generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio', details: error.message },
      { status: 500 }
    );
  }
}