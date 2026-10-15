import React, { useState } from 'react';
import { X, FileSpreadsheet, FileText, Edit3, Search } from 'lucide-react';
import { AbsensiRecord, Siswa } from '../types/attendance';
import { formatTanggalIndonesia } from '../utils/dateUtils';
import { exportSingleDateToExcel } from '../utils/exportExcel';
import { exportSingleDateToPdf } from '../utils/exportPdf';
import { InfoInstitusi } from '../utils/storage';

interface ModalDetailAbsensiProps {
  record: AbsensiRecord | null;
  isOpen: boolean;
  siswaList: Siswa[];
  institusi: InfoInstitusi;
  onEdit: (record: AbsensiRecord) => void;
  onClose: () => void;
  onToast: (msg: string, type: 'success' | 'info') => void;
}

export const ModalDetailAbsensi: React.FC<ModalDetailAbsensiProps> = ({
  record,
  isOpen,
  siswaList,
  institusi,
  onEdit,
  onClose,
  onToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen || !record) return null;

  const hadir = record.daftarKehadiran.filter((k) => k.status === 'Hadir').length;
  const izin = record.daftarKehadiran.filter((k) => k.status === 'Izin').length;
  const sakit = record.daftarKehadiran.filter((k) => k.status === 'Sakit').length;
  const alpha = record.daftarKehadiran.filter((k) => k.status === 'Alpha').length;
  const total = record.daftarKehadiran.length;
  const pct = total > 0 ? ((hadir / total) * 100).toFixed(1) : '0';

  const filteredItems = record.daftarKehadiran.filter((item) =>
    item.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportExcel = () => {
    try {
      exportSingleDateToExcel(record, siswaList, institusi);
      onToast('Laporan Excel harian berhasil diunduh', 'success');
    } catch (e) {
      console.error(e);
      onToast('Gagal mengunduh Excel', 'info');
    }
  };

  const handleExportPdf = () => {
    try {
      exportSingleDateToPdf(record, siswaList, institusi);
      onToast('Laporan PDF harian berhasil diunduh', 'success');
    } catch (e) {
      console.error(e);
      onToast('Gagal mengunduh PDF', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Rincian Presensi Harian
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {formatTanggalIndonesia(record.tanggal)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Tingkat Kehadiran:</span>
            <span className="font-mono text-indigo-700 font-bold text-sm tabular-nums">
              {pct}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-medium">
              Hadir: {hadir}
            </span>
            <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md font-medium">
              Izin: {izin}
            </span>
            <span className="text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md font-medium">
              Sakit: {sakit}
            </span>
            <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md font-medium">
              Alpha: {alpha}
            </span>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari siswa dalam daftar..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(record);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Data</span>
            </button>
          </div>
        </div>

        {/* Student List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider">
                <th className="pb-2 pl-2 w-10">No</th>
                <th className="pb-2">Nama Lengkap</th>
                <th className="pb-2 w-28 text-center">Status</th>
                <th className="pb-2 hidden sm:table-cell">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item, index) => {
                let statusBadge = (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {item.status}
                  </span>
                );

                if (item.status === 'Hadir') {
                  statusBadge = (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      Hadir
                    </span>
                  );
                } else if (item.status === 'Izin') {
                  statusBadge = (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                      Izin
                    </span>
                  );
                } else if (item.status === 'Sakit') {
                  statusBadge = (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      Sakit
                    </span>
                  );
                } else if (item.status === 'Alpha') {
                  statusBadge = (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                      Alpha
                    </span>
                  );
                }

                return (
                  <tr key={item.idSiswa} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 pl-2 font-mono text-slate-400 tabular-nums">
                      {index + 1}
                    </td>
                    <td className="py-2.5 font-medium text-slate-900">
                      {item.namaLengkap}
                    </td>
                    <td className="py-2.5 text-center">{statusBadge}</td>
                    <td className="py-2.5 text-slate-500 text-xs hidden sm:table-cell">
                      {item.catatan || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500">
          <span>Keterangan: {record.keterangan || 'Presensi KBM Harian'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
