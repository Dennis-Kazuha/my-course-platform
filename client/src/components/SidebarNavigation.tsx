import React, { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Lesson {
  id: string;
  title: string;
  isCompleted?: boolean;
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface SidebarNavigationProps {
  chapters: Chapter[];
  currentLessonId?: string;
  onSelectLesson: (lessonId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

/**
 * SidebarNavigation Component
 * Collapsible course syllabus with chapter/lesson hierarchy and completion indicators
 */
export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  chapters,
  currentLessonId,
  onSelectLesson,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(chapters.map((c) => c.id))
  );

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const calculateChapterProgress = (chapter: Chapter) => {
    if (chapter.lessons.length === 0) return 0;
    const completed = chapter.lessons.filter((l) => l.isCompleted).length;
    return Math.round((completed / chapter.lessons.length) * 100);
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleCollapse?.(false)}
          className="mb-4"
          title="Expand sidebar"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
        <div className="flex-1 space-y-2 flex flex-col items-center">
          {chapters.map((chapter) => (
            <div
              key={chapter.id}
              className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-300 transition-colors"
              title={chapter.title}
            >
              {chapter.lessons.length}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 text-sm">Course Outline</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleCollapse?.(true)}
          className="h-6 w-6 p-0"
          title="Collapse sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Chapters and Lessons */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {chapters.map((chapter) => {
            const isExpanded = expandedChapters.has(chapter.id);
            const progress = calculateChapterProgress(chapter);

            return (
              <div key={chapter.id} className="space-y-1">
                {/* Chapter Header */}
                <button
                  onClick={() => toggleChapter(chapter.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-left group"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {chapter.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {progress}% complete
                    </p>
                  </div>
                </button>

                {/* Lessons */}
                {isExpanded && (
                  <div className="ml-2 space-y-1 border-l border-gray-300 pl-2">
                    {chapter.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                          currentLessonId === lesson.id
                            ? "bg-blue-100 text-blue-900"
                            : "hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        {lesson.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                        <span className="text-sm truncate flex-1">
                          {lesson.title}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
