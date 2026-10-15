import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TabInputAbsen } from './components/TabInputAbsen';
import { TabRiwayat } from './components/TabRiwayat';
import { TabLaporan } from './components/TabLaporan';
import { TabKelolaSiswa } from './components/TabKelolaSiswa';
import { ToastContainer } from './components/ToastContainer';
import { useAbsensi } from './hooks/useAbsensi';
import { useToast } from './hooks/useToast';
import { TabKey } from './types/attendance';
import { CalendarCheck, History, BarChart3, Users } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('input');
  const {
    siswaList,
    absensiList,
    institusi,
    saveOrUpdateAbsensi,
    deleteAbsensi,
    addSiswa,
    updateSiswa,
    deleteSiswa,
    updateInstitusi,
    resetToSeedData,
  } = useAbsensi();

  const { toasts, showToast, removeToast } = useToast();

  const getPageHeader = () => {
    switch (activeTab) {
      case 'input':
        return {
          title: 'Input Absensi Harian',
          description: 'Catat kehadiran siswa, beri status perorangan, dan simpan log harian.',
          icon: <CalendarCheck className="w-5 h-5 text-indigo-600" />,
        };
      case 'riwayat':
        return {
          title: 'Riwayat & Kelola Presensi',
          description: 'Daftar seluruh sesi presensi yang tersimpan dengan filter pencarian dan edit data.',
          icon: <History className="w-5 h-5 text-indigo-600" />,
        };
      case 'laporan':
        return {
          title: 'Laporan & Statistik Kehadiran',
          description: 'Analisis visual grafik batang, diagram proporsi, rekapitulasi, serta ekspor Excel dan PDF.',
          icon: <BarChart3 className="w-5 h-5 text-indigo-600" />,
        };
      case 'siswa':
        return {
          title: 'Kelola Anggota & Pengaturan',
          description: 'Master data siswa, pengaturan nama rombel/kelas, dan informasi penanggung jawab.',
          icon: <Users className="w-5 h-5 text-indigo-600" />,
        };
    }
  };

  const header = getPageHeader();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      {/* Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        namaKelas={institusi.namaKelas}
        namaInstansi={institusi.namaInstansi}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Content Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-5">
          <div className="max-w-6xl">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                {header.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                  {header.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {header.description}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full">
          {activeTab === 'input' && (
            <TabInputAbsen
              siswaList={siswaList}
              absensiList={absensiList}
              onSaveAbsensi={saveOrUpdateAbsensi}
              onAddSiswa={addSiswa}
              onToast={showToast}
              namaKelas={institusi.namaKelas}
            />
          )}

          {activeTab === 'riwayat' && (
            <TabRiwayat
              absensiList={absensiList}
              siswaList={siswaList}
              institusi={institusi}
              onUpdateAbsensi={saveOrUpdateAbsensi}
              onDeleteAbsensi={deleteAbsensi}
              onToast={showToast}
              onSwitchToInput={() => setActiveTab('input')}
            />
          )}

          {activeTab === 'laporan' && (
            <TabLaporan
              absensiList={absensiList}
              siswaList={siswaList}
              institusi={institusi}
              onToast={showToast}
            />
          )}

          {activeTab === 'siswa' && (
            <TabKelolaSiswa
              siswaList={siswaList}
              institusi={institusi}
              onAddSiswa={addSiswa}
              onUpdateSiswa={updateSiswa}
              onDeleteSiswa={deleteSiswa}
              onUpdateInstitusi={updateInstitusi}
              onResetSeedData={resetToSeedData}
              onToast={showToast}
            />
          )}
        </main>

        {/* Quiet Subdued Footer */}
        <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
          <div className="max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-slate-700">AbsensiKU</span> — Sistem Presensi & Rekapitulasi Digital
            </div>
            <div className="text-slate-400">
              {institusi.namaInstansi} · {institusi.namaKelas}
            </div>
          </div>
        </footer>
      </div>

      {/* Global Toast Feedback */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
