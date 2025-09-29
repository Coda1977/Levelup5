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
  // Remove style="..." attributes
  return html.replace(/\sstyle\s*=\s*"[^"]*"/gi, "").replace(/\sstyle\s*=\s*'[^']*'/gi, "");
}

function sanitizeIframes(html: string): string {
  // Replace iframes with a sanitized version if src starts with an allowed prefix
  return html.replace(/<iframe([^>]*)>([\s\S]*?)<\/iframe>/gi, (match, attrs) => {
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

    // Whitelist a small set of attributes
    const allowMatch = String(attrs).match(/\sallow\s*=\s*"(.*?)"/i) || String(attrs).match(/\sallow\s*=\s*'(.*?)'/i);
    const referrerMatch = String(attrs).match(/\sreferrerpolicy\s*=\s*"(.*?)"/i) || String(attrs).match(/\sreferrerpolicy\s*=\s*'(.*?)'/i);

    const allow = allowMatch ? allowMatch[1] : "autoplay; encrypted-media; picture-in-picture";
    const referrer = referrerMatch ? referrerMatch[1] : "no-referrer";

    // Basic safe defaults, responsive sizing deferred to container CSS
    return `<iframe src="${src}" loading="lazy" allow="${allow}" referrerpolicy="${referrer}" frameborder="0"></iframe>`;
  });
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