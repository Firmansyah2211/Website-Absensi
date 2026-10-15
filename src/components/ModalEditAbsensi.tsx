import React, { useState, useEffect } from 'react';
import { X, Search, Check, Save } from 'lucide-react';
import { AbsensiRecord, KehadiranItem, StatusKehadiran } from '../types/attendance';
import { formatTanggalIndonesia } from '../utils/dateUtils';

interface ModalEditAbsensiProps {
  record: AbsensiRecord | null;
  isOpen: boolean;
  onSave: (tanggal: string, daftarKehadiran: KehadiranItem[], keterangan?: string) => void;
  onClose: () => void;
}

export const ModalEditAbsensi: React.FC<ModalEditAbsensiProps> = ({
  record,
  isOpen,
  onSave,
  onClose,
}) => {
  const [daftar, setDaftar] = useState<KehadiranItem[]>([]);
  const [keterangan, setKeterangan] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (record) {
      setDaftar(JSON.parse(JSON.stringify(record.daftarKehadiran)));
      setKeterangan(record.keterangan || '');
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const handleStatusChange = (idSiswa: string, newStatus: StatusKehadiran) => {
    setDaftar((prev) =>
      prev.map((item) => (item.idSiswa === idSiswa ? { ...item, status: newStatus } : item))
    );
  };

  const handleCatatanChange = (idSiswa: string, catatan: string) => {
    setDaftar((prev) =>
      prev.map((item) => (item.idSiswa === idSiswa ? { ...item, catatan } : item))
    );
  };

  const handleSetAll = (status: StatusKehadiran) => {
    setDaftar((prev) => prev.map((item) => ({ ...item, status })));
  };

  const handleSave = () => {
    onSave(record.tanggal, daftar, keterangan);
    onClose();
  };

  const filteredDaftar = daftar.filter((item) =>
    item.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hadirCount = daftar.filter((k) => k.status === 'Hadir').length;
  const izinCount = daftar.filter((k) => k.status === 'Izin').length;
  const sakitCount = daftar.filter((k) => k.status === 'Sakit').length;
  const alphaCount = daftar.filter((k) => k.status === 'Alpha').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Ubah Data Presensi Harian
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {formatTanggalIndonesia(record.tanggal)} ({record.tanggal})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Summary status counts */}
          <div className="flex items-center gap-3 text-xs font-semibold tabular-nums">
            <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
              Hadir: {hadirCount}
            </span>
            <span className="text-amber-700 bg-amber-50 px-2 py-1 rounded">
              Izin: {izinCount}
            </span>
            <span className="text-blue-700 bg-blue-50 px-2 py-1 rounded">
              Sakit: {sakitCount}
            </span>
            <span className="text-rose-700 bg-rose-50 px-2 py-1 rounded">
              Alpha: {alphaCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSetAll('Hadir')}
              className="text-xs px-2.5 py-1.5 font-medium rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              Set Semua Hadir
            </button>
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama siswa..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Student Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100">
          <div className="space-y-3">
            {filteredDaftar.map((item, index) => {
              const statusOptions: { value: StatusKehadiran; label: string; activeColor: string }[] = [
                { value: 'Hadir', label: 'Hadir', activeColor: 'bg-emerald-600 text-white' },
                { value: 'Izin', label: 'Izin', activeColor: 'bg-amber-600 text-white' },
                { value: 'Sakit', label: 'Sakit', activeColor: 'bg-blue-600 text-white' },
                { value: 'Alpha', label: 'Alpha', activeColor: 'bg-rose-600 text-white' },
              ];

              return (
                <div
                  key={item.idSiswa}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-50/60 hover:bg-slate-50 transition-colors border border-slate-200/70"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400 w-6 tabular-nums">
                      {index + 1}.
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{item.namaLengkap}</h4>
                      <input
                        type="text"
                        value={item.catatan || ''}
                        onChange={(e) => handleCatatanChange(item.idSiswa, e.target.value)}
                        placeholder="Catatan (opsional)"
                        className="mt-1 text-xs px-2 py-0.5 border border-slate-200 rounded text-slate-600 placeholder-slate-400 bg-white focus:outline-none focus:border-indigo-400 w-48 sm:w-64"
                      />
                    </div>
                  </div>

                  {/* Status Badges / Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {statusOptions.map((opt) => {
                      const isSelected = item.status === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleStatusChange(item.idSiswa, opt.value)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                            isSelected
                              ? `${opt.activeColor} shadow-xs font-semibold`
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Keterangan input */}
          <div className="pt-4 mt-4">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Keterangan Sesi Presensi
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: KBM Tatap Muka Jam Ke-1 s/d 4"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
