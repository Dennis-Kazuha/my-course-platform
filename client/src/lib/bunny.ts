// src/lib/bunny.ts
const LIBRARY_ID = '580881'; 

export function getVideoEmbedUrl(videoId: string) {
  // ★ 關鍵修改：在網址最後面加上 "&context=true"
  // 這會強制 Bunny 重新初始化 API 連線，通常能解決 postMessage 失效的問題
  const url = `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true&context=true`;
  
  console.log('🔗 強制刷新版網址:', url);
  return url;
}

export function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}