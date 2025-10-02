import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-client';
import { SYSTEM_PROMPT } from '@/lib/system-prompt';
import { aiRateLimiter } from '@/lib/rate-limiter';
import { fetchChapterContext, getChapterCount } from '@/lib/rag-helper';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

// Cache for chapter context (refresh every 5 minutes)
let cachedChapterContext: string | null = null;
let cachedChapterCount: number = 0;
let lastCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getChapterContextCached(): Promise<{ context: string; count: number }> {
  const now = Date.now();
  if (cachedChapterContext && now - lastCacheTime < CACHE_DURATION) {
    return { context: cachedChapterContext, count: cachedChapterCount };
  }

  // Fetch fresh data
  const [context, count] = await Promise.all([
    fetchChapterContext(),
    getChapterCount()
  ]);

  cachedChapterContext = context;
  cachedChapterCount = count;
  lastCacheTime = now;

  return { context, count };
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient(request as any);

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting
  if (!aiRateLimiter.check(user.id)) {
    const resetTime = aiRateLimiter.getResetTime(user.id);
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        resetIn: Math.ceil(resetTime / 1000),
      },
      { status: 429 }
    );
  }

  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { message, conversationId } = body;

  if (!message || typeof message !== 'string') {
    return NextResponse.json(
      { error: 'message is required and must be a string' },
      { status: 400 }
    );
  }

  // Validate or create conversation
  let conversation;
  if (conversationId) {
    // Verify conversation belongs to user
    const { data: existingConv, error: convError } = await supabase
      .from('conversations')
      .select('id, user_id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (convError || !existingConv) {
      return NextResponse.json(
        { error: 'Conversation not found or access denied' },
        { status: 404 }
      );
    }
    conversation = existingConv;
  } else {
    // Create new conversation
    const { data: newConv, error: createError } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: message.substring(0, 100), // First 100 chars as title
      })
      .select()
      .single();

    if (createError || !newConv) {
      console.error('Failed to create conversation:', createError);
      return NextResponse.json(
        {
          error: 'Failed to create conversation',
          details: createError?.message,
          code: createError?.code,
          hint: createError?.hint
        },
        { status: 500 }
      );
    }
    conversation = newConv;
  }

  // Save user message
  const { error: userMsgError } = await supabase.from('messages').insert({
    conversation_id: conversation.id,
    role: 'user',
    content: message,
  });

  if (userMsgError) {
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }

  // Get conversation history for context
  const { data: history, error: historyError } = await supabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversation.id)
    .order('created_at', { ascending: true })
    .limit(20); // Last 20 messages for context

  if (historyError) {
    return NextResponse.json(
      { error: 'Failed to load conversation history' },
      { status: 500 }
    );
  }

  try {
    // Get chapter context for RAG
    const { context: chapterContext, count: chapterCount } = await getChapterContextCached();
    
    // Build enhanced system prompt with chapter context
    let enhancedSystemPrompt = SYSTEM_PROMPT.replace('CHAPTER_COUNT', chapterCount.toString());
    
    if (chapterContext) {
      enhancedSystemPrompt += `\n\n---\n\n${chapterContext}`;
    }

    // Call Anthropic API with streaming
    const stream = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: enhancedSystemPrompt,
      messages: history.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      stream: true,
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    let fullResponse = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const text = event.delta.text;
              fullResponse += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }

          // Save assistant response to database
          await supabase.from('messages').insert({
            conversation_id: conversation.id,
            role: 'assistant',
            content: fullResponse,
          });

          // Send completion event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, conversationId: conversation.id })}\n\n`
            )
          );
          controller.close();
        } catch (error: any) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Anthropic API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response', details: error.message },
      { status: 500 }
    );
  }
}