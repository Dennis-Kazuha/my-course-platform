import React, { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Loader2, AlertCircle } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { TranscriptView } from "@/components/TranscriptView";
import { ChatInterface } from "@/components/ChatInterface";
import { SidebarNavigation } from "@/components/SidebarNavigation";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface RouteParams {
  courseId?: string;
  lessonId?: string;
  [key: string]: string | undefined;
}

/**
 * LessonPlayer Page
 * Main interactive lesson experience with video, transcript, and AI tutor
 */
export default function LessonPlayer() {
  const [, params] = useRoute<RouteParams>("/course/:courseId/lesson/:lessonId");
  const { user, isAuthenticated } = useAuth();

  const courseId = params && 'courseId' in params ? ((params as any).courseId as string) : null;
  const lessonId = params && 'lessonId' in params ? ((params as any).lessonId as string) : null;

  const [currentTime, setCurrentTime] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | undefined>(lessonId ?? undefined);

  // Fetch course with chapters and lessons
  const { data: courseData, isLoading: courseLoading, error: courseError } = trpc.course.getCourse.useQuery(
    { courseId: courseId || "" },
    { enabled: !!courseId }
  ) as any;

  // Fetch current lesson with transcripts
  const { data: lessonData, isLoading: lessonLoading, error: lessonError } = trpc.course.getLesson.useQuery(
    { lessonId: selectedLessonId || "" },
    { enabled: !!selectedLessonId }
  ) as any;

  // Fetch user progress
  const { data: userProgress } = trpc.course.getUserLessonProgress.useQuery(
    { lessonId: selectedLessonId || "" },
    { enabled: !!selectedLessonId && isAuthenticated }
  ) as any;

  // Chat history
  const { data: chatHistory } = trpc.chat.getHistory.useQuery(
    { lessonId: selectedLessonId || "" },
    { enabled: !!selectedLessonId && isAuthenticated }
  ) as any;

  // Mutations
  const updateProgressMutation = trpc.course.updateLessonProgress.useMutation();
  const sendChatMutation = trpc.chat.sendMessage.useMutation();

  // Update progress when video time changes
  const handleTimeUpdate = (timeMs: number) => {
    setCurrentTime(timeMs);

    // Update watched duration every 5 seconds
    if (Math.floor(timeMs / 5000) % 1 === 0 && selectedLessonId) {
      updateProgressMutation.mutate({
        lessonId: selectedLessonId,
        watchedDuration: Math.floor(timeMs / 1000),
      });
    }
  };

  // Mark lesson complete when video ends
  const handlePlaybackChange = (isPlaying: boolean) => {
    if (!isPlaying && lessonData?.duration) {
      const watchedPercentage = (currentTime / (lessonData.duration * 1000)) * 100;
      if (watchedPercentage > 90 && selectedLessonId) {
        updateProgressMutation.mutate({
          lessonId: selectedLessonId,
          isCompleted: true,
          watchedDuration: lessonData.duration,
        });
      }
    }
  };

  // Handle lesson selection
  const handleSelectLesson = (newLessonId: string) => {
    setSelectedLessonId(newLessonId);
    setCurrentTime(0);
  };

  // Handle chat message
  const handleSendMessage = async (message: string) => {
    if (!selectedLessonId) throw new Error("No lesson selected");
    const result = await sendChatMutation.mutateAsync({
      lessonId: selectedLessonId,
      message,
    });
    return result;
  };

  // Prepare chapters data for sidebar
  const chaptersForSidebar = courseData?.chapters.map((chapter: any) => ({
    ...chapter,
    lessons: chapter.lessons?.map((lesson: any) => ({
      ...lesson,
      isCompleted: lesson.id === selectedLessonId ? userProgress?.isCompleted : false,
    })) || [],
  })) || [];

  if (!courseId || !lessonId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700">Invalid course or lesson ID</p>
        </div>
      </div>
    );
  }

  if (courseLoading || lessonLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-700">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (courseError || lessonError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700">Error loading lesson</p>
          <p className="text-sm text-gray-500 mt-2">
            {courseError?.message || lessonError?.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <SidebarNavigation
        chapters={chaptersForSidebar}
        currentLessonId={selectedLessonId}
        onSelectLesson={handleSelectLesson}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{lessonData?.title}</h1>
          <p className="text-sm text-gray-600 mt-1">{courseData?.title}</p>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-3 gap-4 h-full p-6">
            {/* Left: Video + Transcript */}
            <div className="col-span-2 flex flex-col gap-4 min-w-0">
              {/* Video Player */}
              <div className="flex-1 min-h-0">
                <VideoPlayer
                  videoId={lessonData?.videoId || ""}
                  title={lessonData?.title}
                  duration={lessonData?.duration || 0}
                  onTimeUpdate={handleTimeUpdate}
                  onPlaybackChange={handlePlaybackChange}
                />
              </div>

              {/* Transcript */}
              <div className="flex-1 min-h-0">
              <TranscriptView
                segments={(lessonData?.transcripts || []).map((t: any) => ({
                  ...t,
                  speaker: t.speaker || undefined,
                }))}
                currentTime={currentTime}
                onSeek={(timeMs) => {
                    setCurrentTime(timeMs);
                    // Seek video to this time
                    const videoElement = document.querySelector("video");
                    if (videoElement) {
                      videoElement.currentTime = timeMs / 1000;
                    }
                  }}
                />
              </div>
            </div>

            {/* Right: Chat */}
            <div className="flex flex-col min-w-0">
              <ChatInterface
                lessonId={selectedLessonId || ""}
                onSendMessage={handleSendMessage}
                initialMessages={
                  chatHistory?.map((msg: any) => ({
                    id: msg.id.toString(),
                    role: msg.role as "user" | "assistant",
                    content: msg.content,
                    citations: msg.citations ? (JSON.parse(msg.citations) as any[]) : undefined,
                    createdAt: new Date(msg.createdAt),
                  })) || []
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
