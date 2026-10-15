import React, { useState } from 'react';
import {
  CalendarCheck,
  History,
  BarChart3,
  Users,
  Menu,
  X,
  School,
} from 'lucide-react';
import { TabKey } from '../types/attendance';

interface SidebarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  namaKelas?: string;
  namaInstansi?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  namaKelas = 'Kelas XII IPA 1',
  namaInstansi = 'SMA Negeri 1 Prestasi',
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { key: TabKey; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      key: 'input',
      label: 'Input Absen',
      icon: <CalendarCheck className="w-5 h-5 shrink-0" />,
      desc: 'Pencatatan presensi harian',
    },
    {
      key: 'riwayat',
      label: 'Riwayat Data',
      icon: <History className="w-5 h-5 shrink-0" />,
      desc: 'Log & edit data kehadiran',
    },
    {
      key: 'laporan',
      label: 'Laporan & Statistik',
      icon: <BarChart3 className="w-5 h-5 shrink-0" />,
      desc: 'Grafik & ekspor Excel/PDF',
    },
    {
      key: 'siswa',
      label: 'Kelola Siswa',
      icon: <Users className="w-5 h-5 shrink-0" />,
      desc: 'Master data anggota kelas',
    },
  ];

  const handleNavClick = (key: TabKey) => {
    onSelectTab(key);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm font-bold text-xl shrink-0">
            A
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight truncate">
              AbsensiKU
            </h1>
            <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
              {namaKelas}
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          aria-label="Tutup menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Menu Utama
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleNavClick(item.key)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-left transition-all duration-150 group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
              }`}
            >
              <div
                className={`${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                }`}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm leading-none truncate">{item.label}</div>
                <div
                  className={`text-[11px] mt-1 leading-tight truncate ${
                    isActive ? 'text-indigo-100' : 'text-slate-400'
                  }`}
                >
                  {item.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70 m-3 rounded-xl">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
            <School className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800 truncate leading-tight">
              {namaInstansi}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              {namaKelas}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base">
            A
          </div>
          <div>
            <span className="font-bold text-slate-900 text-base">AbsensiKU</span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">· {namaKelas}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Buka navigasi"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full shadow-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sticky Sidebar */}
      <aside className="hidden md:block w-64 lg:w-72 h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>
    </>
  );
};
