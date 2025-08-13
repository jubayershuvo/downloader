export function extractYTVideoId(url) {
  
  const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/))([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

export function extractTikTokId(url) {
  try {
    const patterns = [
      /tiktok\.com\/@[^/]+\/video\/(\d+)/, // Standard TikTok link
      /tiktok\.com\/t\/([\w\d]+)/,        // Shortened tiktok.com/t/...
      /vt\.tiktok\.com\/([\w\d]+)/,       // vt.tiktok.com short link
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  } catch {
    return null;
  }
}
