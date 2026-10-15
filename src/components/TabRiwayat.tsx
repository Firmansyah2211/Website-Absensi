import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  FileSpreadsheet,
  FileText,
  Filter,
  ArrowUpDown,
  History,
} from 'lucide-react';
import { AbsensiRecord, KehadiranItem, Siswa } from '../types/attendance';
import { formatTanggalIndonesia } from '../utils/dateUtils';
import { exportSingleDateToExcel } from '../utils/exportExcel';
import { exportSingleDateToPdf } from '../utils/exportPdf';
import { InfoInstitusi } from '../utils/storage';
import { ModalDetailAbsensi } from './ModalDetailAbsensi';
import { ModalEditAbsensi } from './ModalEditAbsensi';
import { ModalConfirm } from './ModalConfirm';

interface TabRiwayatProps {
  absensiList: AbsensiRecord[];
  siswaList: Siswa[];
  institusi: InfoInstitusi;
  onUpdateAbsensi: (tanggal: string, daftar: KehadiranItem[], keterangan?: string) => void;
  onDeleteAbsensi: (id: string) => void;
  onToast: (msg: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  onSwitchToInput: (tanggal: string) => void;
}

export const TabRiwayat: React.FC<TabRiwayatProps> = ({
  absensiList,
  siswaList,
  institusi,
  onUpdateAbsensi,
  onDeleteAbsensi,
  onToast,
  onSwitchToInput,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Modals state
  const [detailRecord, setDetailRecord] = useState<AbsensiRecord | null>(null);
  const [editRecord, setEditRecord] = useState<AbsensiRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<AbsensiRecord | null>(null);

  // Available months in data for filtering
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    absensiList.forEach((r) => {
      const monthPrefix = r.tanggal.substring(0, 7); // YYYY-MM
      set.add(monthPrefix);
    });
    return Array.from(set).sort().reverse();
  }, [absensiList]);

  // Filtered and sorted records
  const filteredRecords = useMemo(() => {
    let result = [...absensiList];

    // Filter by month
    if (filterMonth !== 'all') {
      result = result.filter((r) => r.tanggal.startsWith(filterMonth));
    }

    // Filter by query (date or student name within)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((r) => {
        const matchesDate =
          r.tanggal.includes(q) ||
          formatTanggalIndonesia(r.tanggal).toLowerCase().includes(q) ||
          (r.keterangan && r.keterangan.toLowerCase().includes(q));

        const matchesStudent = r.daftarKehadiran.some((k) =>
          k.namaLengkap.toLowerCase().includes(q)
        );

        return matchesDate || matchesStudent;
      });
    }

    // Sort order
    result.sort((a, b) => {
      return sortOrder === 'desc'
        ? b.tanggal.localeCompare(a.tanggal)
        : a.tanggal.localeCompare(b.tanggal);
    });

    return result;
  }, [absensiList, filterMonth, searchQuery, sortOrder]);

  const handleExportExcel = (record: AbsensiRecord) => {
    try {
      exportSingleDateToExcel(record, siswaList, institusi);
      onToast(`Excel tanggal ${record.tanggal} berhasil diunduh`, 'success');
    } catch (e) {
      console.error(e);
      onToast('Gagal mengunduh Excel', 'error');
    }
  };

  const handleExportPdf = (record: AbsensiRecord) => {
    try {
      exportSingleDateToPdf(record, siswaList, institusi);
      onToast(`PDF tanggal ${record.tanggal} berhasil diunduh`, 'success');
    } catch (e) {
      console.error(e);
      onToast('Gagal mengunduh PDF', 'error');
    }
  };

  const confirmDelete = () => {
    if (!recordToDelete) return;
    onDeleteAbsensi(recordToDelete.id);
    onToast(`Data presensi tanggal ${recordToDelete.tanggal} berhasil dihapus`, 'info');
    setRecordToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tanggal, nama siswa, atau keterangan..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-700"
              >
                <option value="all">Semua Periode</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    Bulan {m}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Riwayat Presensi Tersimpan</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan {filteredRecords.length} sesi data presensi
            </p>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-700">Tidak ada data riwayat</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `Tidak ditemukan presensi yang cocok dengan kata kunci "${searchQuery}".`
                : 'Belum ada data presensi yang tercatat. Silakan lakukan pencatatan pada menu "Input Absen".'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 w-44">Tanggal & Hari</th>
                  <th className="py-3 px-4 w-28 text-center">Total Siswa</th>
                  <th className="py-3 px-4 text-center">Rekap Kehadiran (H / I / S / A)</th>
                  <th className="py-3 px-4 w-28 text-center">% Hadir</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Keterangan</th>
                  <th className="py-3 px-4 w-48 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((record, idx) => {
                  const hadir = record.daftarKehadiran.filter((k) => k.status === 'Hadir').length;
                  const izin = record.daftarKehadiran.filter((k) => k.status === 'Izin').length;
                  const sakit = record.daftarKehadiran.filter((k) => k.status === 'Sakit').length;
                  const alpha = record.daftarKehadiran.filter((k) => k.status === 'Alpha').length;
                  const total = record.daftarKehadiran.length;
                  const pct = total > 0 ? ((hadir / total) * 100).toFixed(0) : '0';

                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3.5 px-4 text-center text-xs font-mono text-slate-400 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                          {record.tanggal}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatTanggalIndonesia(record.tanggal)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs tabular-nums text-slate-700">
                        {total} Siswa
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold font-mono tabular-nums">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60" title="Hadir">
                            H: {hadir}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/60" title="Izin">
                            I: {izin}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60" title="Sakit">
                            S: {sakit}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200/60" title="Alpha">
                            A: {alpha}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold font-mono tabular-nums bg-slate-100 text-slate-800">
                          {pct}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate hidden lg:table-cell">
                        {record.keterangan || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Detail button */}
                          <button
                            type="button"
                            onClick={() => setDetailRecord(record)}
                            title="Lihat Rincian"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => setEditRecord(record)}
                            title="Edit Data Kehadiran"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {/* Export Excel button */}
                          <button
                            type="button"
                            onClick={() => handleExportExcel(record)}
                            title="Unduh Excel Harian"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                          </button>
                          {/* Export PDF button */}
                          <button
                            type="button"
                            onClick={() => handleExportPdf(record)}
                            title="Unduh PDF Harian"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => setRecordToDelete(record)}
                            title="Hapus Sesi Presensi"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <ModalDetailAbsensi
        record={detailRecord}
        isOpen={Boolean(detailRecord)}
        siswaList={siswaList}
        institusi={institusi}
        onEdit={(rec) => {
          setDetailRecord(null);
          setEditRecord(rec);
        }}
        onClose={() => setDetailRecord(null)}
        onToast={onToast}
      />

      <ModalEditAbsensi
        record={editRecord}
        isOpen={Boolean(editRecord)}
        onSave={onUpdateAbsensi}
        onClose={() => setEditRecord(null)}
      />

      <ModalConfirm
        isOpen={Boolean(recordToDelete)}
        title="Hapus Data Presensi?"
        message={
          recordToDelete
            ? `Apakah Anda yakin ingin menghapus catatan presensi untuk tanggal ${recordToDelete.tanggal} (${formatTanggalIndonesia(recordToDelete.tanggal)})? Tindakan ini tidak dapat dibatalkan.`
            : ''
        }
        confirmLabel="Hapus Data"
        cancelLabel="Batal"
        isDanger={true}
        onConfirm={confirmDelete}
        onClose={() => setRecordToDelete(null)}
      />
    </div>
  );
};
