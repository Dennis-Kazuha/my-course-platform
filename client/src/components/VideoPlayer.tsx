import React from "react";
import { getVideoEmbedUrl } from "@/lib/bunny";

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
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  title = "Lesson Video",
}) => {
  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden shadow-lg">
      <div className="relative aspect-video bg-gray-900">
        <iframe
          id="bunny-stream-embed"
          src={getVideoEmbedUrl(videoId)}
          className="absolute top-0 left-0 w-full h-full"
          style={{ border: "none" }}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen={true}
        />
      </div>
      {/* Title */}
      <div className="bg-gray-950 px-4 py-2 border-t border-gray-800">
        <h3 className="text-white font-semibold text-sm">{title}</h3>
      </div>
    </div>
  );
};
