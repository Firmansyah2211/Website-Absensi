import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  UserPlus,
  Save,
  Search,
  CheckCheck,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AbsensiRecord, KehadiranItem, Siswa, StatusKehadiran } from '../types/attendance';
import { formatTanggalIndonesia, getTodayDateString } from '../utils/dateUtils';
import { ModalTambahSiswa } from './ModalTambahSiswa';

interface TabInputAbsenProps {
  siswaList: Siswa[];
  absensiList: AbsensiRecord[];
  onSaveAbsensi: (tanggal: string, daftar: KehadiranItem[], keterangan?: string) => void;
  onAddSiswa: (nama: string, nomorInduk?: string, kelompok?: string) => void;
  onToast: (msg: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  namaKelas?: string;
}

export const TabInputAbsen: React.FC<TabInputAbsenProps> = ({
  siswaList,
  absensiList,
  onSaveAbsensi,
  onAddSiswa,
  onToast,
  namaKelas = 'Kelas XII IPA 1',
}) => {
  const [selectedTanggal, setSelectedTanggal] = useState<string>(getTodayDateString());
  const [kehadiranState, setKehadiranState] = useState<Record<string, { status: StatusKehadiran; catatan: string }>>({});
  const [keterangan, setKeterangan] = useState('Presensi KBM Harian');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check if date already exists in storage
  const existingRecord = useMemo(() => {
    return absensiList.find((r) => r.tanggal === selectedTanggal);
  }, [absensiList, selectedTanggal]);

  // Sync state whenever selected date or existing record changes or student list changes
  useEffect(() => {
    if (existingRecord) {
      const stateMap: Record<string, { status: StatusKehadiran; catatan: string }> = {};
      // Populate from existing
      existingRecord.daftarKehadiran.forEach((item) => {
        stateMap[item.idSiswa] = {
          status: item.status,
          catatan: item.catatan || '',
        };
      });

      // Ensure any newly added student not in this historical record is set to Hadir
      siswaList.forEach((sw) => {
        if (!stateMap[sw.id]) {
          stateMap[sw.id] = { status: 'Hadir', catatan: '' };
        }
      });

      setKehadiranState(stateMap);
      setKeterangan(existingRecord.keterangan || 'Presensi KBM Harian');
    } else {
      // Default: all Hadir
      const defaultMap: Record<string, { status: StatusKehadiran; catatan: string }> = {};
      siswaList.forEach((sw) => {
        defaultMap[sw.id] = { status: 'Hadir', catatan: '' };
      });
      setKehadiranState(defaultMap);
      setKeterangan('Presensi KBM Harian');
    }
  }, [selectedTanggal, existingRecord, siswaList]);

  const handleStatusChange = (idSiswa: string, status: StatusKehadiran) => {
    setKehadiranState((prev) => ({
      ...prev,
      [idSiswa]: {
        ...prev[idSiswa],
        status,
      },
    }));
  };

  const handleCatatanChange = (idSiswa: string, catatan: string) => {
    setKehadiranState((prev) => ({
      ...prev,
      [idSiswa]: {
        ...prev[idSiswa],
        catatan,
      },
    }));
  };

  const handleSetAll = (status: StatusKehadiran) => {
    setKehadiranState((prev) => {
      const next = { ...prev };
      siswaList.forEach((sw) => {
        next[sw.id] = {
          status,
          catatan: prev[sw.id]?.catatan || '',
        };
      });
      return next;
    });
    onToast(`Semua siswa ditandai sebagai "${status}"`, 'info');
  };

  const handleSave = () => {
    if (siswaList.length === 0) {
      onToast('Daftar siswa masih kosong. Tambahkan siswa terlebih dahulu.', 'warning');
      return;
    }

    setIsSaving(true);
    const daftarKehadiran: KehadiranItem[] = siswaList.map((sw) => ({
      idSiswa: sw.id,
      namaLengkap: sw.namaLengkap,
      status: kehadiranState[sw.id]?.status || 'Hadir',
      catatan: kehadiranState[sw.id]?.catatan?.trim() || undefined,
    }));

    onSaveAbsensi(selectedTanggal, daftarKehadiran, keterangan);

    setTimeout(() => {
      setIsSaving(false);
      onToast(
        existingRecord
          ? `Presensi tanggal ${formatTanggalIndonesia(selectedTanggal)} berhasil diperbarui!`
          : `Presensi tanggal ${formatTanggalIndonesia(selectedTanggal)} berhasil disimpan!`,
        'success'
      );
    }, 250);
  };

  // Filter students by search
  const filteredSiswa = siswaList.filter((sw) =>
    sw.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sw.nomorInduk && sw.nomorInduk.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Live counters
  const summaryCounts = useMemo(() => {
    let hadir = 0;
    let izin = 0;
    let sakit = 0;
    let alpha = 0;

    siswaList.forEach((sw) => {
      const st = kehadiranState[sw.id]?.status || 'Hadir';
      if (st === 'Hadir') hadir++;
      else if (st === 'Izin') izin++;
      else if (st === 'Sakit') sakit++;
      else if (st === 'Alpha') alpha++;
    });

    const total = siswaList.length;
    const pct = total > 0 ? (hadir / total) * 100 : 0;

    return { hadir, izin, sakit, alpha, total, pct };
  }, [siswaList, kehadiranState]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Date Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Date Picker Section */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Tanggal Pelaksanaan Absensi</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="date"
                value={selectedTanggal}
                onChange={(e) => setSelectedTanggal(e.target.value)}
                className="px-3.5 py-2 text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors cursor-pointer"
              />
              <span className="text-sm font-medium text-slate-600">
                {formatTanggalIndonesia(selectedTanggal)}
              </span>
              {selectedTanggal === getTodayDateString() && (
                <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Hari Ini
                </span>
              )}
            </div>

            {existingRecord ? (
              <p className="flex items-center gap-1.5 text-xs text-amber-600 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Data tanggal ini sudah tersimpan ({existingRecord.daftarKehadiran.length} siswa).
                  Menyimpan kembali akan memperbarui data.
                </span>
              </p>
            ) : (
              <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Belum ada presensi tersimpan untuk tanggal ini.</span>
              </p>
            )}
          </div>

          {/* Real-time Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 shrink-0">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                Siswa
              </span>
              <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                {summaryCounts.total}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200 text-center">
              <span className="block text-[11px] font-semibold text-emerald-700 uppercase">
                Hadir
              </span>
              <span className="text-lg font-bold text-emerald-700 font-mono tabular-nums">
                {summaryCounts.hadir}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-center">
              <span className="block text-[11px] font-semibold text-amber-700 uppercase">
                Izin
              </span>
              <span className="text-lg font-bold text-amber-700 font-mono tabular-nums">
                {summaryCounts.izin}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-blue-50/80 border border-blue-200 text-center">
              <span className="block text-[11px] font-semibold text-blue-700 uppercase">
                Sakit
              </span>
              <span className="text-lg font-bold text-blue-700 font-mono tabular-nums">
                {summaryCounts.sakit}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-rose-50/80 border border-rose-200 text-center col-span-2 sm:col-span-1">
              <span className="block text-[11px] font-semibold text-rose-700 uppercase">
                Alpha
              </span>
              <span className="text-lg font-bold text-rose-700 font-mono tabular-nums">
                {summaryCounts.alpha}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Action Header & Filter */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
              Tandai Cepat:
            </span>
            <button
              type="button"
              onClick={() => handleSetAll('Hadir')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-colors shadow-2xs"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Semua Hadir</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetAll('Izin')}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-colors shadow-2xs"
            >
              Semua Izin
            </button>
            <button
              type="button"
              onClick={() => handleSetAll('Alpha')}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 transition-colors shadow-2xs"
            >
              Semua Alpha
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau NIS..."
                className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsModalAddOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Siswa</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </div>
        </div>

        {/* Attendance List */}
        {filteredSiswa.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 text-sm">
              {searchQuery
                ? `Tidak ada siswa yang sesuai dengan pencarian "${searchQuery}".`
                : 'Belum ada anggota atau siswa terdaftar.'}
            </p>
            <button
              type="button"
              onClick={() => setIsModalAddOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Siswa Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 w-28">NIS/NIP</th>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4 w-80 text-center">Status Kehadiran</th>
                  <th className="py-3 px-4 w-60">Catatan / Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSiswa.map((siswa, idx) => {
                  const currentStatus = kehadiranState[siswa.id]?.status || 'Hadir';
                  const currentCatatan = kehadiranState[siswa.id]?.catatan || '';

                  const statusConfig: {
                    status: StatusKehadiran;
                    label: string;
                    activeStyle: string;
                    hoverStyle: string;
                  }[] = [
                    {
                      status: 'Hadir',
                      label: 'Hadir',
                      activeStyle: 'bg-emerald-600 text-white shadow-xs font-semibold',
                      hoverStyle: 'hover:bg-emerald-50 hover:text-emerald-700 text-slate-600',
                    },
                    {
                      status: 'Izin',
                      label: 'Izin',
                      activeStyle: 'bg-amber-600 text-white shadow-xs font-semibold',
                      hoverStyle: 'hover:bg-amber-50 hover:text-amber-700 text-slate-600',
                    },
                    {
                      status: 'Sakit',
                      label: 'Sakit',
                      activeStyle: 'bg-blue-600 text-white shadow-xs font-semibold',
                      hoverStyle: 'hover:bg-blue-50 hover:text-blue-700 text-slate-600',
                    },
                    {
                      status: 'Alpha',
                      label: 'Alpha',
                      activeStyle: 'bg-rose-600 text-white shadow-xs font-semibold',
                      hoverStyle: 'hover:bg-rose-50 hover:text-rose-700 text-slate-600',
                    },
                  ];

                  return (
                    <tr
                      key={siswa.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3 px-4 text-center text-xs font-mono text-slate-400 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-500 tabular-nums">
                        {siswa.nomorInduk || '-'}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{siswa.namaLengkap}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg gap-1 border border-slate-200/70">
                          {statusConfig.map((item) => {
                            const isSelected = currentStatus === item.status;
                            return (
                              <button
                                key={item.status}
                                type="button"
                                onClick={() => handleStatusChange(siswa.id, item.status)}
                                className={`px-3 py-1 text-xs rounded-md transition-all duration-150 ${
                                  isSelected
                                    ? item.activeStyle
                                    : `bg-transparent ${item.hoverStyle}`
                                }`}
                              >
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={currentCatatan}
                          onChange={(e) => handleCatatanChange(siswa.id, e.target.value)}
                          placeholder="Catatan (opsional)..."
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer with Keterangan and Primary Save CTA */}
        <div className="p-4 sm:p-6 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Keterangan Sesi Presensi
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: KBM Harian Semester Genap"
              className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || siswaList.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all duration-150"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : existingRecord ? 'Perbarui Absensi' : 'Simpan Absensi'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Add Student */}
      <ModalTambahSiswa
        isOpen={isModalAddOpen}
        defaultKelompok={namaKelas}
        onAdd={onAddSiswa}
        onClose={() => setIsModalAddOpen(false)}
      />
    </div>
  );
};
