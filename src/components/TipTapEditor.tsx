'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect, useState } from 'react';
import { Iframe } from '@/lib/iframe-extension';

type TipTapEditorProps = {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
};

export function TipTapEditor({ content, onChange, placeholder = 'Start writing...' }: TipTapEditorProps) {
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [showSpotifyModal, setShowSpotifyModal] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: 10000,
      }),
      Iframe,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const insertYouTubeEmbed = () => {
    if (!embedUrl || !editor) return;

    // Extract video ID from various YouTube URL formats
    let videoId = '';
    try {
      const url = new URL(embedUrl);
      if (url.hostname.includes('youtube.com')) {
        videoId = url.searchParams.get('v') || '';
      } else if (url.hostname.includes('youtu.be')) {
        videoId = url.pathname.slice(1);
      }
    } catch {
      // If not a valid URL, assume it's just the video ID
      videoId = embedUrl;
    }

    if (videoId) {
      const embedSrc = `https://www.youtube.com/embed/${videoId}`;
      editor.commands.setIframe({ src: embedSrc });
    }

    setEmbedUrl('');
    setShowYouTubeModal(false);
  };

  const insertSpotifyEmbed = () => {
    if (!embedUrl || !editor) return;

    // Convert Spotify URL to embed URL
    let embedSrc = embedUrl;
    if (embedUrl.includes('open.spotify.com') && !embedUrl.includes('/embed/')) {
      embedSrc = embedUrl.replace('open.spotify.com/', 'open.spotify.com/embed/');
    }

    editor.commands.setIframe({ src: embedSrc });

    setEmbedUrl('');
    setShowSpotifyModal(false);
  };

  if (!editor) {
    return null;
  }

  return (
    <>
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-3 py-1 rounded text-sm font-medium ${
              editor.isActive('bold') ? 'bg-accent-yellow text-white' : 'bg-white hover:bg-gray-100'
            }`}
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-3 py-1 rounded text-sm font-medium ${
              editor.isActive('italic') ? 'bg-accent-yellow text-white' : 'bg-white hover:bg-gray-100'
            }`}
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-3 py-1 rounded text-sm font-medium ${
              editor.isActive('heading', { level: 2 }) ? 'bg-accent-yellow text-white' : 'bg-white hover:bg-gray-100'
            }`}
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-3 py-1 rounded text-sm font-medium ${
              editor.isActive('heading', { level: 3 }) ? 'bg-accent-yellow text-white' : 'bg-white hover:bg-gray-100'
            }`}
          >
            H3
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1 rounded text-sm font-medium ${
              editor.isActive('bulletList') ? 'bg-accent-yellow text-white' : 'bg-white hover:bg-gray-100'
            }`}
          >
            • List
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-1 rounded text-sm font-medium ${
              editor.isActive('orderedList') ? 'bg-accent-yellow text-white' : 'bg-white hover:bg-gray-100'
            }`}
          >
            1. List
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`px-3 py-1 rounded text-sm font-medium ${
              editor.isActive('blockquote') ? 'bg-accent-yellow text-white' : 'bg-white hover:bg-gray-100'
            }`}
          >
            "
          </button>
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="px-3 py-1 rounded text-sm font-medium bg-white hover:bg-gray-100"
          >
            ―
          </button>
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="px-3 py-1 rounded text-sm font-medium bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            ↶
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="px-3 py-1 rounded text-sm font-medium bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            ↷
          </button>

          {/* Embed buttons */}
          <div className="border-l border-gray-300 mx-1 h-6 self-center" />

          <button
            onClick={() => setShowYouTubeModal(true)}
            className="px-3 py-1 rounded text-sm font-medium bg-red-500 text-white hover:bg-red-600"
            title="Embed YouTube Video"
          >
            📺 YouTube
          </button>

          <button
            onClick={() => setShowSpotifyModal(true)}
            className="px-3 py-1 rounded text-sm font-medium bg-green-500 text-white hover:bg-green-600"
            title="Embed Spotify Content"
          >
            🎵 Spotify
          </button>
        </div>

        {/* Editor */}
        <EditorContent editor={editor} className="min-h-[300px]" />

        {/* Footer with character count */}
        <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 text-sm text-gray-600">
          {editor.storage.characterCount.characters()}/10,000 characters
        </div>
      </div>

      {/* YouTube Modal */}
      {showYouTubeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Embed YouTube Video</h3>
            <p className="text-sm text-gray-600 mb-4">
              Paste the full YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)
            </p>
            <input
              type="text"
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-accent-yellow focus:border-transparent"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowYouTubeModal(false);
                  setEmbedUrl('');
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={insertYouTubeEmbed}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spotify Modal */}
      {showSpotifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Embed Spotify Content</h3>
            <p className="text-sm text-gray-600 mb-4">
              Paste the full Spotify URL (e.g., https://open.spotify.com/track/... or episode/...)
            </p>
            <input
              type="text"
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              placeholder="https://open.spotify.com/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-accent-yellow focus:border-transparent"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowSpotifyModal(false);
                  setEmbedUrl('');
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={insertSpotifyEmbed}
                className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}