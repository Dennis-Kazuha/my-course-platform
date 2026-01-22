import React, { useRef } from "react";
import { getVideoEmbedUrl, getSecondsFromMs } from "@/lib/bunny";

interface VideoPlayerProps {
  videoId: string;
  title?: string;
  duration?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onPlaybackChange?: (isPlaying: boolean) => void;
}

/**
 * VideoPlayer Component
 * Uses Bunny CDN Stream for video playback
 * Exposes seekTo method for external control
 */
export const VideoPlayer = React.forwardRef<
  { seekTo: (milliseconds: number) => void },
  VideoPlayerProps
>(({ videoId, title = "Lesson Video" }, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Expose seekTo method to parent component
  React.useImperativeHandle(ref, () => ({
    seekTo: (milliseconds: number) => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      const seconds = getSecondsFromMs(milliseconds);

      try {
        // 嘗試用 postMessage API 跳轉
        iframe.contentWindow?.postMessage(
          {
            type: 'seek',
            time: seconds,
          },
          '*'
        );
        console.log(`[VideoPlayer] 跳轉至 ${seconds} 秒`);
      } catch (error) {
        console.error('[VideoPlayer] postMessage 失敗:', error);
        
        // 備用方案：使用 URL 參數重新載入
        let targetUrl = getVideoEmbedUrl(videoId);
        
        if (targetUrl.includes('autoplay=false')) {
          targetUrl = targetUrl.replace('autoplay=false', 'autoplay=true');
        } else if (!targetUrl.includes('autoplay=true')) {
          targetUrl += '&autoplay=true';
        }
        
        const separator = targetUrl.includes('?') ? '&' : '?';
        iframe.src = `${targetUrl}${separator}t=${seconds}`;
      }
    },
  }));

  return (
    <div className="w-full h-full flex flex-col bg-black rounded-lg overflow-hidden shadow-lg">
      {/* 影片容器 - 填滿可用空間 */}
      <div className="flex-1 relative bg-gray-900">
        {videoId ? (
          <iframe
            ref={iframeRef}
            id="bunny-stream-embed"
            src={getVideoEmbedUrl(videoId)}
            className="absolute inset-0 w-full h-full"
            style={{ border: "none" }}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen={true}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <p>影片載入中...</p>
          </div>
        )}
      </div>
      {/* Title */}
      <div className="flex-shrink-0 bg-gray-950 px-4 py-2 border-t border-gray-800">
        <h3 className="text-white font-semibold text-sm">{title}</h3>
      </div>
    </div>
  );
});

VideoPlayer.displayName = "VideoPlayer";
