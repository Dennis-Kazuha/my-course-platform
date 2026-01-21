import { db } from '@/server/db';
import { courses, chapters, lessons, transcripts } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import ClientPlayer from '@/components/ClientPlayer'; // 引入我們剛剛寫的新元件

export default async function CoursePlayerPage() {
  // 1. 拿資料 (Server Side)
  const firstCourse = await db.select().from(courses).limit(1).get();
  if (!firstCourse) return <div>請先執行 seed-bunny.ts</div>;

  const allChapters = await db.select().from(chapters).where(eq(chapters.courseId, firstCourse.id)).all();
  const currentLesson = await db.select().from(lessons).limit(1).get();
  if (!currentLesson) return <div>沒有單元資料</div>;

  const lessonTranscripts = await db.select().from(transcripts).where(eq(transcripts.lessonId, currentLesson.id)).orderBy(transcripts.order).all();

  // 2. 把資料傳給 ClientPlayer 進行渲染
  return (
    <ClientPlayer 
      courseTitle={firstCourse.title}
      lessonTitle={currentLesson.title}
      videoId={currentLesson.videoId}
      chapters={allChapters}
      transcripts={lessonTranscripts}
    />
  );
}