import { ScoreEntry } from '@/lib/store';

interface LeaderboardProps {
  scores: ScoreEntry[];
}

export default function Leaderboard({ scores }: LeaderboardProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3 font-bold border-b">อันดับ</th>
            <th className="p-3 font-bold border-b">ชื่อ</th>
            <th className="p-3 font-bold border-b">เวลา</th>
            <th className="p-3 font-bold border-b">จำนวนครั้งที่แตะ</th>
            <th className="p-3 font-bold border-b">วันที่</th>
          </tr>
        </thead>
        <tbody className="text-gray-800">
          {scores.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">
                ยังไม่มีข้อมูล
              </td>
            </tr>
          ) : (
            scores.map((score, idx) => (
              <tr key={score.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-3">
                  {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : idx + 1}
                </td>
                <td className="p-3 font-medium">{score.name}</td>
                <td className="p-3">{(score.timeMs / 1000).toFixed(3)}s</td>
                <td className="p-3">{score.taps}</td>
                <td className="p-3 text-sm text-gray-500">
                  {score.createdAt ? new Date(score.createdAt).toLocaleString('th-TH') : '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
