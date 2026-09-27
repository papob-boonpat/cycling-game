"use client";
import { useState, useEffect } from 'react';
import { ScoreEntry } from '@/lib/store';

interface LeaderboardProps {
  scores: ScoreEntry[];
}

type Phase = 'idle' | 'drumroll' | 'revealed';

export default function Leaderboard({ scores }: LeaderboardProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [mounted, setMounted] = useState(false);

  const startReveal = () => {
    setPhase('drumroll');
    setTimeout(() => {
      setPhase('revealed');
    }, 2500); // 2.5s suspense animation
  };

  useEffect(() => {
    if (phase === 'revealed') {
      const timer = setTimeout(() => setMounted(true), 50);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const top3 = scores.slice(0, 3);
  const rest = scores.slice(3);

  if (phase !== 'revealed') {
    const isDrumroll = phase === 'drumroll';
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 overflow-hidden">
        <div className="relative mt-10">
          <div className={`absolute inset-0 bg-yellow-400 blur-3xl rounded-full transition-all duration-[2500ms] ease-in-out ${isDrumroll ? 'opacity-100 scale-[3]' : 'opacity-40 animate-pulse'}`}></div>
          <div 
            className={`text-[100px] drop-shadow-[0_20px_20px_rgba(0,0,0,0.3)] relative z-10 transition-all duration-[2500ms] ease-out ${isDrumroll ? 'scale-[2.5] -translate-y-12' : 'animate-bounce'}`}
          >
            🏆
          </div>
        </div>
        
        <div className="h-24 flex items-center justify-center mt-12">
          {isDrumroll ? (
            <div className="text-3xl font-black text-blue-600 animate-pulse drop-shadow-md tracking-widest">
              กำลังค้นหาแชมป์เปี้ยน...
            </div>
          ) : (
            <button 
              onClick={startReveal}
              className="relative text-3xl font-black bg-gradient-to-b from-blue-400 to-blue-600 text-white px-10 py-5 rounded-full border-4 border-blue-300 shadow-[0_0_40px_rgba(59,130,246,0.6)] hover:scale-110 hover:shadow-[0_0_60px_rgba(59,130,246,0.8)] transition-all active:scale-95 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-500"></div>
              <span className="relative drop-shadow-md">เปิดเผยผลการแข่งขัน!</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-12">
      {/* Playful & Shiny Podium Section */}
      {top3.length > 0 && (
        <div className="relative flex items-end justify-center gap-2 sm:gap-6 mt-20 h-80">
          
          {/* Glowing background behind podium */}
          <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-blue-200/50 to-transparent -z-10 rounded-3xl blur-2xl"></div>
          
          {/* 2nd Place */}
          {top3[1] && (
            <div 
              className={`flex flex-col items-center w-1/3 sm:w-44 transition-all duration-700 transform ${mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-[-80px] opacity-0 scale-75'}`}
              style={{ transitionDelay: '300ms', transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              <div className="text-2xl font-black text-slate-700 mb-1 truncate w-full text-center px-2 drop-shadow-sm">{top3[1].name}</div>
              <div className="text-sm font-bold text-slate-100 bg-slate-500 px-4 py-1.5 rounded-full shadow-inner mb-4">{(top3[1].timeMs / 1000).toFixed(3)}s</div>
              <div className="w-full bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 h-40 rounded-t-3xl flex items-center justify-center shadow-[0_-10px_20px_rgba(148,163,184,0.4)] border-t-[6px] border-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent h-1/2"></div>
                <span className="text-6xl drop-shadow-[0_5px_5px_rgba(0,0,0,0.3)] z-10 relative">🥈</span>
                <span className="absolute bottom-[-1rem] text-[7rem] text-slate-500/20 font-black">2</span>
              </div>
            </div>
          )}
          
          {/* 1st Place */}
          {top3[0] && (
            <div 
              className={`flex flex-col items-center w-1/3 sm:w-48 transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-[-100px] opacity-0 scale-75'}`}
              style={{ transitionDelay: '800ms', transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              <div className="text-6xl mb-2 animate-bounce drop-shadow-[0_5px_10px_rgba(0,0,0,0.4)]" style={{ animationDelay: '1.5s' }}>👑</div>
              <div className="text-4xl font-black text-amber-500 mb-1 truncate w-full text-center px-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)]" style={{ WebkitTextStroke: '1px #b45309' }}>{top3[0].name}</div>
              <div className="text-sm font-bold text-yellow-900 bg-yellow-400 px-4 py-1.5 rounded-full shadow-inner mb-4 border-2 border-yellow-300">{(top3[0].timeMs / 1000).toFixed(3)}s</div>
              <div className="w-full bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-600 h-56 rounded-t-3xl flex items-center justify-center shadow-[0_-15px_30px_rgba(234,179,8,0.5)] border-t-[8px] border-yellow-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent h-1/3"></div>
                <span className="text-7xl drop-shadow-[0_5px_10px_rgba(0,0,0,0.4)] z-10 relative">🥇</span>
                <span className="absolute bottom-[-2rem] text-[10rem] text-yellow-700/30 font-black">1</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div 
              className={`flex flex-col items-center w-1/3 sm:w-44 transition-all duration-700 transform ${mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-[-60px] opacity-0 scale-75'}`}
              style={{ transitionDelay: '100ms', transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              <div className="text-2xl font-black text-orange-800 mb-1 truncate w-full text-center px-2 drop-shadow-sm">{top3[2].name}</div>
              <div className="text-sm font-bold text-orange-100 bg-orange-600 px-4 py-1.5 rounded-full shadow-inner mb-4">{(top3[2].timeMs / 1000).toFixed(3)}s</div>
              <div className="w-full bg-gradient-to-b from-orange-300 via-orange-400 to-orange-500 h-32 rounded-t-3xl flex items-center justify-center shadow-[0_-10px_20px_rgba(249,115,22,0.4)] border-t-[6px] border-orange-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent h-1/2"></div>
                <span className="text-5xl drop-shadow-[0_5px_5px_rgba(0,0,0,0.3)] z-10 relative">🥉</span>
                <span className="absolute bottom-[-1rem] text-[6rem] text-orange-700/20 font-black">3</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Playful Table */}
      {rest.length > 0 && (
        <div 
          className={`overflow-x-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border-4 border-blue-50 transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'} max-w-4xl mx-auto p-2`}
          style={{ transitionDelay: '1200ms' }}
        >
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-100/50 text-blue-800 text-sm uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4 rounded-tl-xl">อันดับ</th>
                <th className="p-4">ชื่อ</th>
                <th className="p-4">เวลา</th>
                <th className="p-4 hidden sm:table-cell">แตะสลับ</th>
                <th className="p-4 text-right rounded-tr-xl">วันที่</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 font-medium">
              {rest.map((score, idx) => (
                <tr key={score.id} className="border-b-2 border-blue-50/50 last:border-b-0 hover:bg-blue-50 hover:scale-[1.01] transition-transform duration-200">
                  <td className="p-4 text-blue-400 font-black text-lg">#{idx + 4}</td>
                  <td className="p-4 text-gray-900 font-bold">{score.name}</td>
                  <td className="p-4">{(score.timeMs / 1000).toFixed(3)}<span className="text-gray-400 text-xs ml-1">s</span></td>
                  <td className="p-4 hidden sm:table-cell text-blue-600 font-bold">{score.taps}</td>
                  <td className="p-4 text-sm text-gray-400 text-right">
                    {score.createdAt ? new Date(score.createdAt).toLocaleDateString('th-TH') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {scores.length === 0 && (
        <div className="flex justify-center mt-12">
          <div className="text-center text-gray-500 font-bold text-xl bg-gray-100 px-12 py-6 rounded-3xl border-4 border-gray-200 border-dashed">
            ยังไม่มีข้อมูลผู้เข้าแข่งขัน
          </div>
        </div>
      )}
    </div>
  );
}
