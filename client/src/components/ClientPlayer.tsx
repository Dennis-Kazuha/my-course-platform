'use client';

import { getVideoEmbedUrl, formatTime } from '@/lib/bunny';
import { Play, FileText, MessageSquare } from 'lucide-react';

type Props = {
  courseTitle: string;
  lessonTitle: string;
  videoId: string;
  chapters: any[];
  transcripts: any[];
};

export default function ClientPlayer({ courseTitle, lessonTitle, videoId, chapters, transcripts }: Props) {

  const handleSeek = (seconds: number) => {
    const iframe = document.getElementById('bunny-stream-embed') as HTMLIFrameElement;
    
    if (iframe) {
      // 1. 取得原始網址
      let targetUrl = getVideoEmbedUrl(videoId);

      // ★ 關鍵修正：把原本的 autoplay=false 換成 autoplay=true
      // 這樣影片重新載入後，就會立刻開始播放，不會停下來！
      if (targetUrl.includes('autoplay=false')) {
        targetUrl = targetUrl.replace('autoplay=false', 'autoplay=true');
      } else if (!targetUrl.includes('autoplay=true')) {
        // 如果原本沒寫，就補上去
        targetUrl += '&autoplay=true';
      }

      // 2. 加上時間參數
      const separator = targetUrl.includes('?') ? '&' : '?';
      
      console.log(`[Player] 跳轉至 ${seconds} 秒並自動播放`);
      
      // 3. 執行核彈跳轉
      iframe.src = `${targetUrl}${separator}t=${seconds}`;
    }
  };

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-200 flex flex-col overflow-hidden font-sans">
      <header className="h-14 border-b border-slate-800 flex items-center px-4 bg-slate-900 shrink-0 z-10">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="bg-blue-600 text-xs px-2 py-1 rounded">MVP</span>
          {courseTitle}
        </h1>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 左側：章節 */}
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-800 font-semibold text-slate-400 text-sm">課程章節</div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {chapters.map(chapter => (
              <div key={chapter.id} className="space-y-1">
                <div className="px-2 py-1 text-xs font-medium text-slate-500 uppercase tracking-wider">{chapter.title}</div>
                <div className="bg-blue-600/10 text-blue-400 px-3 py-2 rounded-md text-sm flex items-center gap-2 border border-blue-600/20">
                  <Play size={14} /> {lessonTitle}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 中間：播放器 */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          <div className="h-[45vh] bg-black shrink-0 relative w-full border-b border-slate-800">
            <iframe 
              id="bunny-stream-embed" 
              src={getVideoEmbedUrl(videoId)}
              className="absolute top-0 left-0 w-full h-full"
              style={{ border: 'none' }}
              // 確保這裡有允許 autoplay
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" 
              allowFullScreen={true}
            />
          </div>

          {/* 逐字稿 */}
          <div className="flex-1 bg-slate-950 flex flex-col min-h-0 relative">
            <div className="h-10 border-b border-slate-800 flex items-center px-4 bg-slate-900/50 gap-2 text-sm font-medium text-slate-400 shrink-0">
              <FileText size={16} /> 智慧逐字稿 (點擊可跳轉)
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-1">
              {transcripts.map((t) => (
                <div 
                  key={t.id} 
                  onClick={() => handleSeek(t.startTime)} 
                  className="group flex gap-4 hover:bg-slate-900 p-3 rounded-lg transition-all cursor-pointer border border-transparent hover:border-slate-800 select-none"
                >
                  <span className="text-slate-500 text-xs font-mono pt-1 w-12 shrink-0 text-right">
                    {formatTime(t.startTime)}
                  </span>
                  <p className="text-slate-300 leading-relaxed group-hover:text-blue-300 transition-colors text-base">
                    {t.text}
                  </p>
                </div>
              ))}
              <div className="h-20" />
            </div>
          </div>
        </div>

        {/* 右側 AI */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
           <div className="h-14 border-b border-slate-800 flex items-center px-4 gap-2 font-semibold text-slate-200">
            <MessageSquare size={18} className="text-blue-500" /> AI 學習助教
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
             <div className="bg-slate-800/50 p-3 rounded-lg text-sm text-slate-300">👋 任何問題都可以問我！</div>
          </div>
          <div className="p-4 border-t border-slate-800 bg-slate-900">
            <input type="text" placeholder="輸入問題..." className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}