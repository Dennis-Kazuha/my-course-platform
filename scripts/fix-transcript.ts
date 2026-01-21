// scripts/fix-transcript.ts
import { db } from '../src/server/db';
import { transcripts, lessons } from '../src/server/db/schema';
import { eq } from 'drizzle-orm';

// 這是你提供的原始逐字稿
const RAW_TRANSCRIPT = `
(0:00) It is now starting my day at like 30 miles an hour instead of zero. (0:07) Whatever you're best at, (0:10) you're probably better than AI. (0:12) So how do we use AI to help you with the other aspects of your job? (0:17) Lots of the stuff AI is good at is the stuff you hate the most.
(0:20) Managing your grocery list, your workout plan. (0:22) Plan a trip to Hawaii. (0:24) The AI will do that for you.
(0:25) Cool, finished, next task. (0:26) If you want creative work, then you want the AI to hallucinate. (0:34) Whoa, didn't think of that.
(0:37) We are actually going to generate a business plan. (0:39) Five business ideas, 20 creative names. (0:41) I could have done it at two o'clock in the morning.
(0:43) You do not have to be a coder. (0:44) My boss will make me cry if you don't answer. (0:49) I'm not advocating that you threaten your AI bestie, (0:53) but you got to do what you need to do to get it done.
(0:59) We're now in the AI age. (1:01) Let's buckle down and figure out what that means today. (1:03) I'm Manuel Sensini.
(1:04) I'm Don Allen III. (1:05) I'm Allie K. Miller. (1:06) I'm Ethan Mollick, and this is MasterClass.
`;

// 把時間字串 (例如 "1:05") 轉成秒數 (65)
function parseTimeToSeconds(timeStr: string): number {
  const [min, sec] = timeStr.split(':').map(Number);
  return min * 60 + sec;
}

async function main() {
  console.log('🔧 開始修復逐字稿...');

  // 1. 抓取第一堂課
  const lesson = await db.select().from(lessons).limit(1).get();
  if (!lesson) {
    console.error('❌ 找不到單元 (Lesson)，請先執行 seed-bunny.ts');
    return;
  }
  console.log(`正在修復單元: ${lesson.title} (ID: ${lesson.id})`);

  // 2. 清除該單元舊的「一坨」逐字稿
  await db.delete(transcripts).where(eq(transcripts.lessonId, lesson.id));
  console.log('🗑️  舊資料已清除');

  // 3. 智慧切割邏輯
  // 正則表達式：尋找 (1:23) 這樣的格式
  const regex = /\((\d+:\d+)\)\s*(.*?)(?=\(\d+:\d+\)|$)/gs;
  
  let match;
  let count = 0;
  let order = 1;

  while ((match = regex.exec(RAW_TRANSCRIPT)) !== null) {
    const timeStr = match[1]; // 例如 "0:07"
    const text = match[2].trim().replace(/\n/g, ' '); // 該段文字，並去掉換行
    
    if (text) {
      // 這裡簡單計算結束時間：下一句開始前，或是預設 +5 秒
      const startTime = parseTimeToSeconds(timeStr);
      
      await db.insert(transcripts).values({
        lessonId: lesson.id,
        startTime: startTime,
        endTime: startTime + 5, // 暫時預設，之後可以用下一句的時間來修正
        text: currentText: text, // 修正：變數名稱對應
        text: text,
        order: order++,
      });
      count++;
    }
  }

  console.log(`✅ 成功寫入 ${count} 條逐字稿片段！`);
}

main().catch(console.error);