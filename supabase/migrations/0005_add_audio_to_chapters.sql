-- Add audio_url field to chapters table for TTS functionality
alter table public.chapters
add column audio_url text;

-- Add comment for documentation
comment on column public.chapters.audio_url is 'URL to the generated TTS audio file stored in Supabase Storage';