/**
 * Helper utility to normalize and sanitize image URLs from various image hosts
 * (Imgur, Google Drive, Dropbox, etc.) to ensure direct, hotlinkable image rendering.
 */

export function normalizeImageUrl(inputUrl: string | undefined | null): string {
  if (!inputUrl) return '';
  let url = inputUrl.trim();
  if (!url) return '';

  // 1. Imgur URLs
  // Handles:
  // - https://imgur.com/a/abc1234 (album)
  // - https://imgur.com/gallery/abc1234 (gallery)
  // - https://imgur.com/abc1234 (post page)
  // - http://imgur.com/abc1234
  // - https://m.imgur.com/abc1234 (mobile)
  // - https://i.imgur.com/abc1234 (missing extension)
  // - https://i.imgur.com/abc1234.jpg?1 (trailing params)
  const imgurMatch = url.match(/^https?:\/\/(?:[a-z0-9]+\.)?imgur\.com\/(?:a\/|gallery\/)?([a-zA-Z0-9]+)(?:\.[a-zA-Z]{3,4})?(?:\?.*)?$/i);
  if (imgurMatch && imgurMatch[1]) {
    const id = imgurMatch[1];
    // Check if original URL specified an extension
    const extMatch = url.match(/\.(jpg|jpeg|png|webp|gif)/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
    return `https://i.imgur.com/${id}.${ext}`;
  }

  // Handle i.imgur.com without extension
  if (/^https?:\/\/i\.imgur\.com\/[a-zA-Z0-9]+$/i.test(url)) {
    return `${url}.jpg`;
  }

  // 2. Google Drive sharing links
  // https://drive.google.com/file/d/ID/view?usp=sharing -> direct link
  const gdriveMatch =
    url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i) ||
    url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/i);
  if (gdriveMatch && gdriveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${gdriveMatch[1]}`;
  }

  // 3. Dropbox sharing links
  if (url.includes('dropbox.com')) {
    if (url.includes('dl=0')) {
      return url.replace('dl=0', 'raw=1');
    }
    if (!url.includes('raw=1')) {
      return `${url}${url.includes('?') ? '&' : '?'}raw=1`;
    }
  }

  return url;
}

/**
 * If an Imgur image with .jpg fails, this returns the .png version to try as a fallback
 */
export function getAlternativeImgurUrl(url: string): string | null {
  if (!url || !url.includes('i.imgur.com')) return null;

  if (url.endsWith('.jpg') || url.endsWith('.jpeg')) {
    return url.replace(/\.(jpg|jpeg)$/i, '.png');
  }
  if (url.endsWith('.png')) {
    return url.replace(/\.png$/i, '.webp');
  }
  return null;
}
