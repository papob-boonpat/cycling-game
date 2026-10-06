"use client";

interface LobbyProps {
  name: string;
  onNameChange: (name: string) => void;
  raceOpen: boolean;
  connected: boolean;
  onStart: () => void;
}

export default function Lobby({
  name,
  onNameChange,
  raceOpen,
  connected,
  onStart
}: LobbyProps) {
  const handleStart = () => {
    if (raceOpen) onStart();
  };

  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center my-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Cycling Tap Game</h1>

        <div className="mb-4 text-left">
          <label className="block text-gray-700 font-medium mb-2">ชื่อผู้เล่น</label>
          <input
            type="text"
            value={name}
            onChange={e => onNameChange(e.target.value)}
            placeholder="กรอกชื่อของคุณ"
            className="w-full border border-gray-300 rounded-lg p-3 text-lg text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
            maxLength={20}
          />
        </div>

        {/* Gate status — the admin opens the race from /admin */}
        <div
          className={`mb-2 rounded-lg p-3 text-sm font-medium border-2 ${
            raceOpen
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          {raceOpen ? (
            <>✅ เปิดให้แข่งแล้ว — กดเริ่มเมื่อพร้อม</>
          ) : (
            <>🔒 รอผู้ดูแลเปิดการแข่งขัน...</>
          )}
        </div>

        {/* Connection trouble is advisory: it never blocks an already-open race. */}
        {!connected && (
          <div className="mb-2 text-xs text-gray-500">⏳ กำลังเชื่อมต่อ...</div>
        )}

        <button
          onClick={handleStart}
          onTouchStart={e => {
            // Also handle touch start for instant mobile response
            e.preventDefault();
            handleStart();
          }}
          disabled={!raceOpen}
          className="mt-4 w-full bg-blue-600 enabled:hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg text-xl transition-colors"
        >
          {raceOpen ? 'เริ่ม' : 'รอเปิดการแข่งขัน'}
        </button>
      </div>
    </div>
  );
}
