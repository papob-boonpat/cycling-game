"use client";

import { useEffect, useState } from 'react';

const POLL_INTERVAL_MS = 3000;

export default function AdminPanel() {
  const [raceOpen, setRaceOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Poll so the toggle reflects changes made from another device.
  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      try {
        const res = await fetch('/api/admin', { cache: 'no-store' });
        if (!res.ok) throw new Error('โหลดข้อมูลไม่สำเร็จ');
        const data = await res.json();
        if (cancelled) return;
        setRaceOpen(Boolean(data.raceOpen));
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      }
    };

    tick();
    const intervalId = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  const toggle = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raceOpen: !raceOpen })
      });
      if (!res.ok) throw new Error('คำสั่งไม่สำเร็จ');
      const data = await res.json();
      setRaceOpen(Boolean(data.raceOpen));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setBusy(false);
    }
  };

  const resetGame = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch('/api/admin/reset', { method: 'POST', cache: 'no-store' });
      if (!res.ok) throw new Error('ล้างคะแนนไม่สำเร็จ');
      const data = await res.json();
      setRaceOpen(Boolean(data.raceOpen));
      setConfirmingReset(false);
      setNotice(`ล้างคะแนนแล้ว ${data.cleared} รายการ — เริ่มเกมใหม่`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 gap-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ผู้ดูแลระบบ</h1>
        <div className={`text-lg font-bold ${raceOpen ? 'text-green-600' : 'text-amber-600'}`}>
          {raceOpen ? 'เปิด — ผู้เล่นกดเริ่มได้' : 'ปิด — ผู้เล่นรออยู่'}
        </div>
      </div>

      <button
        onClick={toggle}
        onTouchStart={e => {
          e.preventDefault();
          toggle();
        }}
        disabled={busy}
        aria-pressed={raceOpen}
        className={`w-full max-w-md aspect-square rounded-3xl text-white font-black text-4xl sm:text-5xl shadow-2xl transition-colors active:scale-95 disabled:opacity-60 ${
          raceOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {raceOpen ? 'ปิดการแข่งขัน' : 'เปิดการแข่งขัน'}
      </button>

      <div className="w-full max-w-md flex flex-col gap-2">
        {confirmingReset ? (
          <>
            <div className="text-center text-sm font-bold text-red-700">
              ล้างคะแนนทั้งหมดและเริ่มเกมใหม่? ไม่สามารถย้อนกลับได้
            </div>
            <div className="flex gap-2">
              <button
                onClick={resetGame}
                disabled={busy}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow transition-colors active:scale-95 disabled:opacity-60"
              >
                ยืนยันล้างคะแนน
              </button>
              <button
                onClick={() => setConfirmingReset(false)}
                disabled={busy}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl shadow transition-colors active:scale-95 disabled:opacity-60"
              >
                ยกเลิก
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => {
              setNotice(null);
              setConfirmingReset(true);
            }}
            disabled={busy}
            className="w-full border-2 border-red-300 bg-white hover:bg-red-50 text-red-700 font-bold py-3 rounded-xl shadow-sm transition-colors active:scale-95 disabled:opacity-60"
          >
            ล้างคะแนนทั้งหมด &amp; เริ่มเกมใหม่
          </button>
        )}
      </div>

      {notice && (
        <div className="bg-green-50 border-2 border-green-200 text-green-800 rounded-lg p-3 text-sm max-w-md w-full text-center">
          {notice}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-800 rounded-lg p-3 text-sm max-w-md w-full text-center">
          {error}
        </div>
      )}

      <a href="/results" className="text-blue-600 hover:text-blue-800 underline font-medium">
        ดูผลการแข่งขัน
      </a>
    </div>
  );
}
