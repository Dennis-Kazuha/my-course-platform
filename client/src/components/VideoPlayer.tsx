import React, { useRef, useEffect, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  videoId: string;
  title?: string;
  duration?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onPlaybackChange?: (isPlaying: boolean) => void;
}

/**
 * VideoPlayer Component
 * Placeholder for Cloudflare Stream integration
 * In production, replace with actual Cloudflare Stream embed
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  title = "Lesson Video",
  duration = 0,
  onTimeUpdate,
  onPlaybackChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      onPlaybackChange?.(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time * 1000); // Convert to milliseconds
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleSeek = (newTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newTime / 1000; // Convert from milliseconds
      setCurrentTime(newTime / 1000);
      onTimeUpdate?.(newTime);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden shadow-lg">
      <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
        {/* Placeholder video element - In production, use Cloudflare Stream embed */}
        <video
          ref={videoRef}
          className="w-full h-full"
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => {
            setIsPlaying(false);
            onPlaybackChange?.(false);
          }}
        >
          <source
            src={`https://example.com/videos/${videoId}.mp4`}
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        {/* Play overlay when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors cursor-pointer"
            onClick={handlePlayPause}>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-colors">
              <Play className="w-12 h-12 text-white fill-white" />
            </div>
          </div>
        )}
      </div>

      {/* Video Controls */}
      <div className="bg-gray-950 p-4 space-y-3">
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime * 1000}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Control buttons and time display */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePlayPause}
              className="text-white hover:bg-gray-800"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleMuteToggle}
              className="text-white hover:bg-gray-800"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>

            <span className="text-sm text-gray-400">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleFullscreen}
            className="text-white hover:bg-gray-800"
          >
            <Maximize2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Title */}
      <div className="bg-gray-950 px-4 py-2 border-t border-gray-800">
        <h3 className="text-white font-semibold text-sm">{title}</h3>
      </div>
    </div>
  );
};
