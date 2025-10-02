import { createServiceSupabaseClient } from './supabase-client';

/**
 * Fetches all published chapter content for RAG context
 * Returns formatted content that can be included in the AI prompt
 */
export async function fetchChapterContext(): Promise<string> {
  const supabase = createServiceSupabaseClient();

  try {
    // Fetch all published chapters with their categories
    const { data: chapters, error } = await supabase
      .from('chapters')
      .select(`
        id,
        title,
        content,
        display_order,
        category:categories(title, display_order)
      `)
      .eq('is_published', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching chapters for RAG:', error);
      return '';
    }

    if (!chapters || chapters.length === 0) {
      return '';
    }

    // Format chapters into a structured context string
    const contextParts: string[] = [];
    
    // Group chapters by category
    const chaptersByCategory = chapters.reduce((acc: any, chapter: any) => {
      const categoryTitle = chapter.category?.title || 'Uncategorized';
      if (!acc[categoryTitle]) {
        acc[categoryTitle] = [];
      }
      acc[categoryTitle].push(chapter);
      return acc;
    }, {});

    // Build the context string
    contextParts.push('# Level Up Knowledge Base\n');
    contextParts.push(`Total Chapters: ${chapters.length}\n`);

    for (const [categoryTitle, categoryChapters] of Object.entries(chaptersByCategory) as [string, any[]][]) {
      contextParts.push(`\n## ${categoryTitle}\n`);
      
      for (const chapter of categoryChapters) {
        contextParts.push(`\n### ${chapter.title}\n`);
        if (chapter.content) {
          // Truncate very long content to avoid token limits
          const content = chapter.content.length > 3000 
            ? chapter.content.substring(0, 3000) + '...[content truncated]'
            : chapter.content;
          contextParts.push(`${content}\n`);
        }
      }
    }

    return contextParts.join('\n');
  } catch (error) {
    console.error('Unexpected error fetching chapter context:', error);
    return '';
  }
}

/**
 * Gets the count of published chapters
 */
export async function getChapterCount(): Promise<number> {
  const supabase = createServiceSupabaseClient();

  try {
    const { count, error } = await supabase
      .from('chapters')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    if (error) {
      console.error('Error counting chapters:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Unexpected error counting chapters:', error);
    return 0;
  }
}