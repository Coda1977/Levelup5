import { sanitizeHtml } from '../sanitize';

describe('sanitizeHtml', () => {
  describe('Safe HTML Elements', () => {
    it('should allow basic HTML tags', () => {
      const input = '<h2>Title</h2><p>Paragraph</p>';
      const result = sanitizeHtml(input);
      expect(result).toContain('<h2>Title</h2>');
      expect(result).toContain('<p>Paragraph</p>');
    });

    it('should allow lists', () => {
      const input = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const result = sanitizeHtml(input);
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>Item 1</li>');
      expect(result).toContain('<li>Item 2</li>');
    });

    it('should allow ordered lists', () => {
      const input = '<ol><li>First</li><li>Second</li></ol>';
      const result = sanitizeHtml(input);
      expect(result).toContain('<ol>');
      expect(result).toContain('<li>First</li>');
    });

    it('should allow links with href', () => {
      const input = '<a href="https://example.com">Link</a>';
      const result = sanitizeHtml(input);
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('Link');
    });
  });

  describe('XSS Prevention', () => {
    it('should remove script tags', () => {
      const input = '<p>Safe</p><script>alert("XSS")</script>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
      expect(result).toContain('<p>Safe</p>');
    });

    it('should remove inline event handlers', () => {
      const input = '<div onclick="alert(\'XSS\')">Click me</div>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('alert');
    });

    it('should remove javascript: protocol in links', () => {
      const input = '<a href="javascript:alert(\'XSS\')">Bad Link</a>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('javascript:');
    });

    it('should remove onerror attributes', () => {
      const input = '<img src="x" onerror="alert(\'XSS\')">';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('onerror');
    });

    it('should handle multiple XSS attempts', () => {
      const input = `
        <p>Safe content</p>
        <script>alert('XSS1')</script>
        <div onclick="alert('XSS2')">Text</div>
        <img src=x onerror="alert('XSS3')">
      `;
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('alert');
      expect(result).toContain('<p>Safe content</p>');
    });
  });

  describe('Iframe Whitelist', () => {
    it('should allow YouTube embeds', () => {
      const input = '<iframe src="https://www.youtube.com/embed/VIDEO_ID"></iframe>';
      const result = sanitizeHtml(input);
      expect(result).toContain('iframe');
      expect(result).toContain('youtube.com/embed');
    });

    it('should allow Spotify embeds', () => {
      const input = '<iframe src="https://open.spotify.com/embed/track/ID"></iframe>';
      const result = sanitizeHtml(input);
      expect(result).toContain('iframe');
      expect(result).toContain('spotify.com/embed');
    });

    it('should remove non-whitelisted iframes', () => {
      const input = '<iframe src="https://evil.com/malicious"></iframe>';
      const result = sanitizeHtml(input);
      // Should either remove iframe or strip the src
      expect(result).not.toContain('evil.com');
    });

    it('should remove javascript: in iframe src', () => {
      const input = '<iframe src="javascript:alert(\'XSS\')"></iframe>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('javascript:');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      const result = sanitizeHtml('');
      expect(result).toBe('');
    });

    it('should handle null/undefined gracefully', () => {
      expect(() => sanitizeHtml(null as any)).not.toThrow();
      expect(() => sanitizeHtml(undefined as any)).not.toThrow();
    });

    it('should handle very long content', () => {
      const longContent = '<p>' + 'a'.repeat(10000) + '</p>';
      const result = sanitizeHtml(longContent);
      expect(result).toContain('<p>');
      expect(result.length).toBeGreaterThan(10000);
    });

    it('should handle special characters', () => {
      const input = '<p>Special: &lt; &gt; &amp; " \'</p>';
      const result = sanitizeHtml(input);
      expect(result).toContain('<p>');
    });

    it('should handle nested HTML', () => {
      const input = '<div><p><strong>Bold</strong> and <em>italic</em></p></div>';
      const result = sanitizeHtml(input);
      expect(result).toContain('<strong>Bold</strong>');
      expect(result).toContain('<em>italic</em>');
    });
  });

  describe('Content Preservation', () => {
    it('should preserve text content', () => {
      const input = '<p>This is important text</p>';
      const result = sanitizeHtml(input);
      expect(result).toContain('This is important text');
    });

    it('should preserve formatting', () => {
      const input = '<p><strong>Bold</strong> and <em>italic</em> text</p>';
      const result = sanitizeHtml(input);
      expect(result).toContain('<strong>Bold</strong>');
      expect(result).toContain('<em>italic</em>');
    });

    it('should preserve links', () => {
      const input = '<p>Visit <a href="https://example.com">our site</a></p>';
      const result = sanitizeHtml(input);
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('our site');
    });
  });
});