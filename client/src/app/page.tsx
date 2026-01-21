"use client";

import React, { useState } from "react";
import { 
  Play, 
  Pause, 
  MessageSquare, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Search,
  BookOpen,
  Send,
  MoreVertical,
  Settings
} from "lucide-react";

// --- 假資料 (Mock Data) ---
const COURSE_DATA = {
  title: "加密貨幣期權實戰：從入門到精通",
  chapters: [
    {
      id: 1,
      title: "第一章：基礎觀念",
      lessons: [
        { id: 101, title: "什麼是期權 (Options)？", duration: "10:20", completed: true },
        { id: 102, title: "Call 與 Put 的運作原理", duration: "15:30", completed: true },
        { id: 103, title: "風險指標 Greeks 詳解", duration: "20:00", completed: false, active: true },
      ]
    },
    {
      id: 2,
      title: "第二章：實戰策略",
      lessons: [
        { id: 201, title: "垂直價差策略 (Vertical Spread)", duration: "12:45", completed: false },
        { id: 202, title: "鐵兀鷹 (Iron Condor) 操作", duration: "18:10", completed: false },
      ]
    }
  ]
};

const TRANSCRIPT_DATA = [
    { time: "05:18", text: "大家好，今天要講的是 Greeks 風險指標。", active: false },
    { time: "05:20", text: "其中 Delta 代表的是價格的敏感度，這非常重要。", active: true },
    { time: "05:25", text: "如果你買入一個 Call，Delta 通常是正數，代表比特幣漲你也賺。", active: false },
    { time: "05:30", text: "但是別忘了還有 Theta，這是時間價值的流失。", active: false },
    { time: "05:40", text: "我們可以用這張圖表來看出 Theta 如何每天吃掉你的權利金。", active: false },
    { time: "05:55", text: "所以做賣方 (Seller) 的優勢就在這裡，時間站在你這邊。", active: false },
];

export default function CoursePlayerPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", content: "你好！我是你的 AI 助教。關於這堂課「Greeks 風險指標」有任何聽不懂的地方，都可以隨時問我喔！" }
  ]);

  // 模擬發送訊息
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    // 1. 加入使用者訊息
    const userMsg = { role: "user", content: chatMessage };
    setChatHistory((prev) => [...prev, userMsg]);
    setChatMessage("");

    // 2. 模擬 AI 回應 (假裝思考一下)
    setTimeout(() => {
      setChatHistory((prev) => [...prev, { 
        role: "ai", 
        content: `這是個好問題！老師在 05:20 的時候有提到「Delta 代表價格敏感度」。簡單來說，Delta = 0.5 代表幣價漲 1 元，期權漲 0.5 元。`,
        citation: "05:20"
      }]);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans overflow-hidden">
      
      {/* 1. 左側選單 (Sidebar) */}
      <div className="w-80 bg-gray-950 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h1 className="font-bold text-lg text-white truncate">{COURSE_DATA.title}</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {COURSE_DATA.chapters.map((chapter) => (
            <div key={chapter.id} className="mb-2">
              <div className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-900/50">
                {chapter.title}
              </div>
              <div>
                {chapter.lessons.map((lesson) => (
                  <button 
                    key={lesson.id}
                    className={`w-full flex items-center px-4 py-3 hover:bg-gray-800 transition-colors text-left group
                      ${lesson.active ? "bg-gray-800 border-l-4 border-blue-500" : "border-l-4 border-transparent"}
                    `}
                  >
                    <span className="mr-3">
                      {lesson.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Circle className={`w-4 h-4 ${lesson.active ? "text-blue-400 fill-blue-400/20" : "text-gray-600"}`} />
                      )}
                    </span>
                    <div className="flex-1">
                      <div className={`text-sm ${lesson.active ? "text-white font-medium" : "text-gray-400 group-hover:text-gray-200"}`}>
                        {lesson.title}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{lesson.duration}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. 中間區域 (Main Content) */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 上方：影片播放器 (Video Player) */}
        <div className="relative aspect-video bg-black flex items-center justify-center group">
          {/* 模擬影片畫面 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
              </button>
              
              <div className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden cursor-pointer">
                <div className="w-1/3 h-full bg-blue-500"></div>
              </div>
              
              <span className="text-sm font-medium">05:20 / 20:00</span>
              <Settings className="w-5 h-5 cursor-pointer hover:text-white" />
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-6xl text-gray-700 mb-4 font-bold">VIDEO PLAYER</div>
            <p className="text-gray-500">Cloudflare Stream integration goes here</p>
          </div>
        </div>

        {/* 下方：逐字稿 (Transcript) */}
        <div className="flex-1 bg-gray-900 border-t border-gray-800 flex flex-col min-h-0">
          <div className="px-6 py-3 border-b border-gray-800 flex items-center justify-between bg-gray-900">
            <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> 
              智慧逐字稿
            </h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="搜尋影片內容..." 
                className="bg-gray-800 text-sm text-gray-300 rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {TRANSCRIPT_DATA.map((item, index) => (
              <div 
                key={index} 
                className={`flex gap-4 p-2 rounded-lg transition-colors cursor-pointer
                  ${item.active ? "bg-blue-900/20 border border-blue-900/50" : "hover:bg-gray-800/50"}
                `}
              >
                <span className={`text-xs font-mono mt-1 ${item.active ? "text-blue-400" : "text-gray-500"}`}>
                  {item.time}
                </span>
                <p className={`text-sm leading-relaxed ${item.active ? "text-blue-100" : "text-gray-400"}`}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 右側：AI 助教 (AI Chat) */}
      <div className="w-96 bg-gray-950 border-l border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800 bg-gray-950 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">AI 學習助教</div>
              <div className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
              </div>
            </div>
          </div>
          <MoreVertical className="w-4 h-4 text-gray-500 cursor-pointer" />
        </div>

        {/* 聊天記錄 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm
                ${msg.role === "user" 
                  ? "bg-blue-600 text-white rounded-tr-sm" 
                  : "bg-gray-800 text-gray-200 rounded-tl-sm border border-gray-700"}
              `}>
                <p>{msg.content}</p>
                {/* 顯示引用來源連結 */}
                {msg.citation && (
                  <button className="mt-2 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-400/10 px-2 py-1 rounded transition-colors">
                    <Play className="w-3 h-3 fill-current" />
                    跳轉至 {msg.citation}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 輸入框 */}
        <div className="p-4 border-t border-gray-800 bg-gray-950">
          <form onSubmit={handleSendMessage} className="relative">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="問問關於這堂課的問題..."
              className="w-full bg-gray-900 border border-gray-800 text-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600"
            />
            <button 
              type="submit"
              disabled={!chatMessage.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-gray-600">AI 內容可能會有誤差，請以影片為主</p>
          </div>
        </div>
      </div>

    </div>
  );
}