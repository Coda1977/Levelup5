// Minimal HTML sanitizer for rendering chapter content
// NOTE: This is a conservative, allowlist-leaning sanitizer intended for server-side use.
// It removes scripts, inline event handlers, style attributes, and unknown iframes.
// Allowed iframe prefixes are limited to YouTube and Spotify per security policy.

const ALLOWED_IFRAME_PREFIXES = [
  "https://www.youtube.com/embed/",
  "https://open.spotify.com/embed/",
];

function stripScripts(html: string): string {
  // Remove <script>...</script> blocks
  return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
}

function stripEventHandlers(html: string): string {
  // Remove inline event handlers like onclick="...", onload='...'
  let out = html.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "");
  out = out.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "");
  out = out.replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "");
  return out;
}

function stripStyles(html: string): string {
  // Remove style="..." attributes except for iframe-wrapper divs
  return html.replace(/\sstyle\s*=\s*"[^"]*"/gi, (match, offset, string) => {
    // Check if this is within an iframe-wrapper div
    const before = string.substring(Math.max(0, offset - 100), offset);
    if (before.includes('class="iframe-wrapper"')) {
      return match; // Keep style for iframe-wrapper
    }
    return '';
  }).replace(/\sstyle\s*=\s*'[^']*'/gi, '');
}

function sanitizeIframes(html: string): string {
  // Handle old video-embed and spotify-embed divs (legacy format)
  html = html.replace(/<div class="(?:video-embed|spotify-embed)"[^>]*>[\s\S]*?<iframe([^>]*)>[\s\S]*?<\/iframe>[\s\S]*?<\/div>/gi, (match, iframeAttrs) => {
    // Extract src from iframe
    const srcMatch = String(iframeAttrs).match(/\ssrc\s*=\s*"(.*?)"/i) || String(iframeAttrs).match(/\ssrc\s*=\s*'(.*?)'/i);
    if (!srcMatch) {
      return ""; // drop if no src
    }
    const src = srcMatch[1];

    // Allow only known safe providers
    const allowed = ALLOWED_IFRAME_PREFIXES.some((prefix) => src.startsWith(prefix));
    if (!allowed) {
      return ""; // drop unknown embeds
    }

    // Determine if it's YouTube or Spotify
    const isYouTube = src.includes('youtube.com');
    const isSpotify = src.includes('spotify.com');

    if (isYouTube) {
      return `<div class="iframe-wrapper"><iframe src="${src}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
    } else if (isSpotify) {
      return `<div class="iframe-wrapper"><iframe src="${src}" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe></div>`;
    }

    return "";
  });

  // Handle iframe-wrapper divs from TipTap
  html = html.replace(/<div class="iframe-wrapper">[\s\S]*?<iframe([^>]*)>[\s\S]*?<\/iframe>[\s\S]*?<\/div>/gi, (match, iframeAttrs) => {
    // Extract src from iframe
    const srcMatch = String(iframeAttrs).match(/\ssrc\s*=\s*"(.*?)"/i) || String(iframeAttrs).match(/\ssrc\s*=\s*'(.*?)'/i);
    if (!srcMatch) {
      return ""; // drop if no src
    }
    const src = srcMatch[1];

    // Allow only known safe providers
    const allowed = ALLOWED_IFRAME_PREFIXES.some((prefix) => src.startsWith(prefix));
    if (!allowed) {
      return ""; // drop unknown embeds
    }

    // Determine if it's YouTube or Spotify
    const isYouTube = src.includes('youtube.com');
    const isSpotify = src.includes('spotify.com');

    if (isYouTube) {
      // YouTube: responsive 16:9 container
      return `<div class="iframe-wrapper"><iframe src="${src}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
    } else if (isSpotify) {
      // Spotify: fixed height with border radius
      return `<div class="iframe-wrapper"><iframe src="${src}" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe></div>`;
    }

    return "";
  });

  // Also handle standalone iframes (legacy support)
  html = html.replace(/<iframe([^>]*)>[\s\S]*?<\/iframe>/gi, (match, attrs) => {
    // Extract src
    const srcMatch = String(attrs).match(/\ssrc\s*=\s*"(.*?)"/i) || String(attrs).match(/\ssrc\s*=\s*'(.*?)'/i);
    if (!srcMatch) {
      return ""; // drop if no src
    }
    const src = srcMatch[1];

    // Allow only known safe providers
    const allowed = ALLOWED_IFRAME_PREFIXES.some((prefix) => src.startsWith(prefix));
    if (!allowed) {
      return ""; // drop unknown embeds
    }

    // Determine if it's YouTube or Spotify
    const isYouTube = src.includes('youtube.com');
    const isSpotify = src.includes('spotify.com');

    if (isYouTube) {
      return `<div class="iframe-wrapper"><iframe src="${src}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
    } else if (isSpotify) {
      return `<div class="iframe-wrapper"><iframe src="${src}" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe></div>`;
    }

    return "";
  });

  return html;
}

function stripDangerousProtocols(html: string): string {
  // Remove javascript: and data: from href/src where possible
  return html
    .replace(/\shref\s*=\s*"(javascript:|data:)/gi, ' href="#')
    .replace(/\shref\s*=\s*'(javascript:|data:)/gi, " href='#")
    .replace(/\ssrc\s*=\s*"(javascript:|data:)/gi, ' src="#"')
    .replace(/\ssrc\s*=\s*'(javascript:|data:)/gi, " src='#");
}

export function sanitizeHtml(html: string): string {
  if (!html) return "";
  let out = html;

  // Order matters: strip dangerous constructs first, then tighten attributes, then handle embeds.
  out = stripScripts(out);
  out = stripDangerousProtocols(out);
  out = stripEventHandlers(out);
  out = stripStyles(out);
  out = sanitizeIframes(out);

  // Optional: collapse excess whitespace
  out = out.replace(/\s{3,}/g, " ");

  return out;
}