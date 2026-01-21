import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check } from "lucide-react";

interface TranscriptSegment {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
  speaker?: string;
}

interface TranscriptViewProps {
  segments: TranscriptSegment[];
  currentTime: number; // in milliseconds
  onSeek: (timeMs: number) => void;
}

/**
 * TranscriptView Component
 * Displays time-coded transcript segments with auto-scroll and click-to-seek functionality
 */
export const TranscriptView: React.FC<TranscriptViewProps> = ({
  segments,
  currentTime,
  onSeek,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [activeSegmentId, setActiveSegmentId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Auto-scroll to active segment
  useEffect(() => {
    const activeSegment = segments.find(
      (s) => currentTime >= s.startTime && currentTime < s.endTime
    );

    if (activeSegment) {
      setActiveSegmentId(activeSegment.id);

      // Scroll to active segment
      const element = document.getElementById(`segment-${activeSegment.id}`);
      if (element && scrollAreaRef.current) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [currentTime, segments]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-900">Transcript</h3>
        <p className="text-xs text-gray-500 mt-1">Click on any segment to jump to that time</p>
      </div>

      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 space-y-3">
          {segments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No transcript available for this lesson</p>
            </div>
          ) : (
            segments.map((segment) => {
              const isActive = activeSegmentId === segment.id;
              return (
                <div
                  key={segment.id}
                  id={`segment-${segment.id}`}
                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer group ${
                    isActive
                      ? "bg-blue-50 border-blue-300 shadow-md"
                      : "bg-gray-50 border-transparent hover:bg-gray-100 hover:border-gray-200"
                  }`}
                  onClick={() => onSeek(segment.startTime)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSeek(segment.startTime);
                          }}
                          className="text-xs font-mono bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-gray-700 transition-colors"
                        >
                          {formatTime(segment.startTime)}
                        </button>
                        {segment.speaker && (
                          <span className="text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-1 rounded">
                            {segment.speaker}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed break-words">
                        {segment.text}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(segment.text, segment.id);
                      }}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy text"
                    >
                      {copiedId === segment.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
