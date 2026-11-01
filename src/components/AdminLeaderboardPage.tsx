import { useState, useEffect, useMemo } from 'react';
import {
  fetchLeaderboard,
  softDeleteAllLeaderboard,
  restoreAllLeaderboard,
  type LeaderboardEntry,
  isSupabaseConfigured,
} from '../lib/supabase';
import { BearMascot } from './BearMascot';
import { playPopSound } from '../lib/sound';

export default function AdminLeaderboardPage({ onBack }: { onBack?: () => void }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCloud, setIsCloud] = useState(isSupabaseConfigured);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadData = async () => {
    setLoading(true);
    setActionMessage(null);
    try {
      const res = await fetchLeaderboard(500, includeDeleted);
      setEntries(res.entries);
      setIsCloud(res.isCloud);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [includeDeleted]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    if (!searchTerm.trim()) return entries;
    const term = searchTerm.toLowerCase();
    return entries.filter(
      (e) =>
        e.playerName.toLowerCase().includes(term) ||
        e.sessionId.toLowerCase().includes(term) ||
        (e.bearType === 'sunbear' ? 'gấu chó' : 'gấu ngựa').includes(term)
    );
  }, [entries, searchTerm]);

  // Handle Soft Delete All
  const handleSoftDeleteAll = async () => {
    playPopSound();
    const confirmed = window.confirm(
      'CẢNH BÁO: Bạn có chắc chắn muốn XÓA MỀM toàn bộ người chơi trên bảng xếp hạng?\n\nDữ liệu sẽ bị ẩn khỏi bảng xếp hạng của người chơi nhưng vẫn có thể xuất file CSV snapshot.'
    );
    if (!confirmed) return;

    setLoading(true);
    const res = await softDeleteAllLeaderboard();
    if (res.success) {
      setActionMessage({ text: 'Đã xóa mềm toàn bộ người chơi thành công!', type: 'success' });
      await loadData();
    } else {
      setActionMessage({ text: `Lỗi khi xóa: ${res.error}`, type: 'error' });
      setLoading(false);
    }
  };

  // Handle Restore All
  const handleRestoreAll = async () => {
    playPopSound();
    const confirmed = window.confirm('Bạn có muốn KHÔI PHỤC lại toàn bộ người chơi đã xóa mềm không?');
    if (!confirmed) return;

    setLoading(true);
    const res = await restoreAllLeaderboard();
    if (res.success) {
      setActionMessage({ text: 'Đã khôi phục toàn bộ người chơi thành công!', type: 'success' });
      await loadData();
    } else {
      setActionMessage({ text: `Lỗi khi khôi phục: ${res.error}`, type: 'error' });
      setLoading(false);
    }
  };

  // Export CSV snapshot
  const handleExportCSV = () => {
    playPopSound();
    if (entries.length === 0) {
      alert('Không có dữ liệu người chơi để xuất file.');
      return;
    }

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const filename = `Bang_Xep_Hang_Chuyen_Nha_Gau_Snapshot_${timestamp}.csv`;

    // BOM for UTF-8 in Excel
    const BOM = '\uFEFF';
    const headers = [
      'Hạng',
      'Tên người chơi',
      'Loài gấu đồng hành',
      'Tổng điểm',
      'Số trạm hoàn thành',
      'Thời gian cập nhật',
    ];

    const rows = entries.map((item, idx) => [
      idx + 1,
      `"${(item.playerName || 'Người chơi ẩn danh').replace(/"/g, '""')}"`,
      item.bearType === 'sunbear' ? 'Gấu Chó' : 'Gấu Ngựa',
      item.score,
      `"'\t${item.completedLevelsCount}/13"`, // Thêm tab escape để Excel không tự động parse nhầm thành ngày tháng (ví dụ 13-Aug)
      item.updatedAt ? `"${new Date(item.updatedAt).toLocaleString('vi-VN')}"` : '',
    ]);

    const csvContent = BOM + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setActionMessage({ text: `Đã xuất snapshot thành công: ${filename}`, type: 'success' });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Header */}
      <header className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-2.5">
          {onBack ? (
            <button
              onClick={() => {
                playPopSound();
                onBack();
              }}
              className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 border border-slate-600 flex items-center justify-center text-sm font-bold transition-colors"
              title="Quay lại game"
            >
              ←
            </button>
          ) : (
            <a
              href="/"
              className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 border border-slate-600 flex items-center justify-center text-sm font-bold transition-colors"
              title="Về trang game"
            >
              🎮
            </a>
          )}
          <div>
            <h1 className="text-sm font-black tracking-wide text-amber-400 flex items-center gap-1.5">
              <span>🛡️</span> Quản Trị Bảng Xếp Hạng (Admin)
            </h1>
            <p className="text-[10px] text-slate-400">
              {isCloud ? '🟢 Kết nối Supabase Trực Tuyến' : '🟡 Dữ liệu Cục Bộ (Local Storage)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-2.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold border border-slate-600 flex items-center gap-1"
            title="Làm mới dữ liệu"
          >
            <span>🔄</span> {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
      </header>

      {/* Control Action Bar */}
      <div className="p-3 bg-slate-850 border-b border-slate-700 flex flex-col gap-2 shrink-0">
        {actionMessage && (
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between ${
              actionMessage.type === 'success' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}
          >
            <span>{actionMessage.text}</span>
            <button onClick={() => setActionMessage(null)} className="text-xs opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {/* Action Buttons: Export CSV & Soft Delete */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs border border-emerald-500 shadow flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>📥</span>
            <span>Xuất CSV Snapshot ({entries.length})</span>
          </button>

          <button
            onClick={handleSoftDeleteAll}
            className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs border border-rose-500 shadow flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>🗑️</span>
            <span>Xóa Mềm Toàn Bộ</span>
          </button>

          <button
            onClick={handleRestoreAll}
            className="py-2 px-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs border border-slate-600 transition-colors"
            title="Khôi phục lại toàn bộ người chơi đã xóa mềm"
          >
            <span>♻️ Khôi phục</span>
          </button>
        </div>

        {/* Search & Toggle Deleted Filter */}
        <div className="flex items-center gap-2 mt-1">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên hoặc mã người chơi..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-amber-500"
            />
            <span className="absolute left-2.5 top-2 text-xs opacity-50">🔍</span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          <label className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium cursor-pointer shrink-0 bg-slate-900/60 px-2 py-1.5 rounded-xl border border-slate-800">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
              className="accent-amber-500"
            />
            <span>Xem cả mục đã xóa</span>
          </label>
        </div>
      </div>

      {/* Main Players List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm flex flex-col items-center">
            <span className="text-3xl animate-bounce mb-2">🐾</span>
            <span>Đang tải danh sách người chơi...</span>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            <span className="text-3xl block mb-2">📭</span>
            {searchTerm
              ? 'Không tìm thấy người chơi nào khớp với từ khóa.'
              : 'Hiện chưa có dữ liệu người chơi trên bảng xếp hạng.'}
          </div>
        ) : (
          filteredEntries.map((item, index) => {
            const rank = index + 1;
            return (
              <div
                key={`${item.sessionId}-${index}`}
                className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2.5 transition-all ${
                  item.isDeleted
                    ? 'bg-slate-950/40 border-slate-800 opacity-50'
                    : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Rank */}
                  <div className="w-6 text-center font-black text-xs text-amber-400 shrink-0">
                    {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}
                  </div>

                  {/* Mascot */}
                  <div className="w-8 h-8 rounded-xl bg-slate-700/80 border border-slate-600 flex items-center justify-center shrink-0">
                    <BearMascot type={item.bearType} size={26} />
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-100 truncate flex items-center gap-1.5">
                      <span>{item.playerName || 'Người chơi ẩn danh'}</span>
                      {item.isDeleted && (
                        <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                          Đã xóa
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                      <span>Trạm: {item.completedLevelsCount}/13</span>
                      <span>•</span>
                      <span>{item.updatedAt ? new Date(item.updatedAt).toLocaleTimeString('vi-VN') : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <div className="text-sm font-black text-amber-400">{item.score}</div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">điểm</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <footer className="px-4 py-2 bg-slate-850 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
        <span>Tổng số: {filteredEntries.length} người chơi</span>
        <span>Game Hành Trình Của Gấu</span>
      </footer>
    </div>
  );
}

