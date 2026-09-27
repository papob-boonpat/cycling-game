"use client";

import { useState } from 'react';
import { useRaceEngine, RaceResult } from '@/lib/useRaceEngine';
import Track from './Track';
import Cyclist from './Cyclist';
import ChainringButton from './ChainringButton';
import Hud from './Hud';

export default function Game() {
  const [name, setName] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [finalResult, setFinalResult] = useState<RaceResult | null>(null);

  const handleFinish = async (result: RaceResult) => {
    setFinalResult(result);
    setSubmitState('submitting');
    
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || 'Anonymous',
          timeMs: Math.floor(result.timeMs),
          taps: result.taps,
        })
      });
      
      if (!res.ok) throw new Error('Submission failed');
      setSubmitState('success');
    } catch (err) {
      console.error(err);
      setSubmitState('error');
    }
  };

  const { start, tap, phase, getSnapshot } = useRaceEngine(handleFinish);

  return (
    <div className="fixed inset-0 overflow-hidden bg-sky-200 touch-none">
      <Track getSnapshot={getSnapshot} />
      <Cyclist getSnapshot={getSnapshot} />
      <Hud phase={phase} getSnapshot={getSnapshot} />
      
      {phase === 'idle' && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Cycling Tap Game</h1>
            <div className="mb-4 text-left">
              <label className="block text-gray-700 font-medium mb-2">ชื่อผู้เล่น</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="กรอกชื่อของคุณ"
                className="w-full border border-gray-300 rounded-lg p-3 text-lg text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                maxLength={20}
              />
            </div>
            <button 
              onClick={() => {
                if (!name.trim()) setName('Anonymous');
                start();
              }}
              onTouchStart={(e) => {
                // Also handle touch start for instant mobile response
                e.preventDefault();
                if (!name.trim()) setName('Anonymous');
                start();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-xl transition-colors"
            >
              เริ่ม
            </button>
          </div>
        </div>
      )}

      {phase === 'countdown' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="text-8xl font-black text-white drop-shadow-2xl animate-bounce">
            ไป!
          </div>
        </div>
      )}

      <ChainringButton phase={phase} onTap={tap} getSnapshot={getSnapshot} />

      {phase === 'finished' && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center">
            {submitState === 'submitting' && (
              <h2 className="text-2xl font-bold mb-4 text-gray-800">กำลังส่งผลลัพธ์...</h2>
            )}
            {submitState === 'success' && (
              <>
                <h2 className="text-3xl font-bold mb-2 text-green-600">ส่งผลลัพธ์แล้ว</h2>
                <div className="text-xl text-gray-700 mb-6">
                  เวลาของคุณ: {finalResult ? (finalResult.timeMs / 1000).toFixed(3) : 0} วินาที
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    window.location.reload();
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-xl transition-colors"
                >
                  เล่นอีกครั้ง
                </button>
              </>
            )}
            {submitState === 'error' && (
              <>
                <h2 className="text-2xl font-bold mb-4 text-red-600">เกิดข้อผิดพลาด กรุณาลองใหม่</h2>
                <button 
                  onClick={() => window.location.reload()}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    window.location.reload();
                  }}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg text-xl transition-colors"
                >
                  เล่นอีกครั้ง
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
