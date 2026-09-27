import { listTop } from '@/lib/store';
import Leaderboard from '@/components/Leaderboard';

export const dynamic = 'force-dynamic';

export default async function ResultsPage() {
  const scores = await listTop(100);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ผลการแข่งขัน</h1>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-colors"
          >
            <a href="/results">รีเฟรช</a>
          </button>
        </div>
        
        <Leaderboard scores={scores} />
      </div>
    </div>
  );
}
