import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartOptions,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  FileSpreadsheet,
  FileText,
  Calendar,
  Users,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Download,
} from 'lucide-react';
import { AbsensiRecord, RekapSiswaBulanan, Siswa } from '../types/attendance';
import { BULAN_INDONESIA, formatTanggalIndonesia, getBulanTahunLabel } from '../utils/dateUtils';
import { exportRekapToExcel } from '../utils/exportExcel';
import { exportRekapToPdf } from '../utils/exportPdf';
import { InfoInstitusi } from '../utils/storage';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface TabLaporanProps {
  absensiList: AbsensiRecord[];
  siswaList: Siswa[];
  institusi: InfoInstitusi;
  onToast: (msg: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export const TabLaporan: React.FC<TabLaporanProps> = ({
  absensiList,
  siswaList,
  institusi,
  onToast,
}) => {
  const currentDate = new Date();
  const [selectedBulan, setSelectedBulan] = useState<number>(currentDate.getMonth() + 1);
  const [selectedTahun, setSelectedTahun] = useState<number>(currentDate.getFullYear());
  const [selectedDateForDoughnut, setSelectedDateForDoughnut] = useState<string>('all');
  const [tableSearch, setTableSearch] = useState('');

  // Records for chosen month and year
  const recordsBulanIni = useMemo(() => {
    const prefix = `${selectedTahun}-${String(selectedBulan).padStart(2, '0')}`;
    return absensiList
      .filter((r) => r.tanggal.startsWith(prefix))
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  }, [absensiList, selectedBulan, selectedTahun]);

  // Aggregate student breakdown
  const rekapPerSiswa: RekapSiswaBulanan[] = useMemo(() => {
    return siswaList.map((sw) => {
      let hadir = 0;
      let izin = 0;
      let sakit = 0;
      let alpha = 0;

      recordsBulanIni.forEach((rec) => {
        const item = rec.daftarKehadiran.find((k) => k.idSiswa === sw.id);
        if (item) {
          if (item.status === 'Hadir') hadir++;
          else if (item.status === 'Izin') izin++;
          else if (item.status === 'Sakit') sakit++;
          else if (item.status === 'Alpha') alpha++;
        }
      });

      const totalHari = recordsBulanIni.length;
      const persentaseHadir = totalHari > 0 ? (hadir / totalHari) * 100 : 0;

      return {
        idSiswa: sw.id,
        namaLengkap: sw.namaLengkap,
        nomorInduk: sw.nomorInduk,
        hadir,
        izin,
        sakit,
        alpha,
        totalHari,
        persentaseHadir,
      };
    });
  }, [siswaList, recordsBulanIni]);

  // Overall totals for summary cards
  const totals = useMemo(() => {
    let totHadir = 0;
    let totIzin = 0;
    let totSakit = 0;
    let totAlpha = 0;

    rekapPerSiswa.forEach((sw) => {
      totHadir += sw.hadir;
      totIzin += sw.izin;
      totSakit += sw.sakit;
      totAlpha += sw.alpha;
    });

    const grand = totHadir + totIzin + totSakit + totAlpha;
    const avgPct = grand > 0 ? (totHadir / grand) * 100 : 0;

    return {
      totHadir,
      totIzin,
      totSakit,
      totAlpha,
      grand,
      avgPct,
      totalHari: recordsBulanIni.length,
    };
  }, [rekapPerSiswa, recordsBulanIni]);

  // Bar Chart Data (Daily Breakdown in Selected Month)
  const barChartData = useMemo(() => {
    const labels = recordsBulanIni.map((r) => {
      const parts = r.tanggal.split('-');
      return `${parts[2]}/${parts[1]}`;
    });

    const hadirData = recordsBulanIni.map(
      (r) => r.daftarKehadiran.filter((k) => k.status === 'Hadir').length
    );
    const izinData = recordsBulanIni.map(
      (r) => r.daftarKehadiran.filter((k) => k.status === 'Izin').length
    );
    const sakitData = recordsBulanIni.map(
      (r) => r.daftarKehadiran.filter((k) => k.status === 'Sakit').length
    );
    const alphaData = recordsBulanIni.map(
      (r) => r.daftarKehadiran.filter((k) => k.status === 'Alpha').length
    );

    return {
      labels,
      datasets: [
        {
          label: 'Hadir',
          data: hadirData,
          backgroundColor: '#10b981', // emerald-500
          borderRadius: 4,
        },
        {
          label: 'Izin',
          data: izinData,
          backgroundColor: '#f59e0b', // amber-500
          borderRadius: 4,
        },
        {
          label: 'Sakit',
          data: sakitData,
          backgroundColor: '#3b82f6', // blue-500
          borderRadius: 4,
        },
        {
          label: 'Alpha',
          data: alphaData,
          backgroundColor: '#ef4444', // rose-500
          borderRadius: 4,
        },
      ],
    };
  }, [recordsBulanIni]);

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          font: { family: 'Plus Jakarta Sans', size: 12 },
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: 'Plus Jakarta Sans', weight: 'bold' },
        bodyFont: { family: 'Plus Jakarta Sans' },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } },
      },
      y: {
        beginAtZero: true,
        ticks: { precision: 0, font: { family: 'Plus Jakarta Sans', size: 11 } },
      },
    },
  };

  // Doughnut Chart Data (Proportion of Attendance)
  const doughnutData = useMemo(() => {
    let h = totals.totHadir;
    let i = totals.totIzin;
    let s = totals.totSakit;
    let a = totals.totAlpha;

    if (selectedDateForDoughnut !== 'all') {
      const single = recordsBulanIni.find((r) => r.tanggal === selectedDateForDoughnut);
      if (single) {
        h = single.daftarKehadiran.filter((k) => k.status === 'Hadir').length;
        i = single.daftarKehadiran.filter((k) => k.status === 'Izin').length;
        s = single.daftarKehadiran.filter((k) => k.status === 'Sakit').length;
        a = single.daftarKehadiran.filter((k) => k.status === 'Alpha').length;
      }
    }

    return {
      labels: ['Hadir', 'Izin', 'Sakit', 'Alpha'],
      datasets: [
        {
          data: [h, i, s, a],
          backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'],
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  }, [totals, selectedDateForDoughnut, recordsBulanIni]);

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 12,
          font: { family: 'Plus Jakarta Sans', size: 12 },
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const val = Number(context.raw) || 0;
            const sum = context.dataset.data.reduce((acc: number, cur) => acc + (Number(cur) || 0), 0);
            const pct = sum > 0 ? ((val / sum) * 100).toFixed(1) : '0';
            return ` ${context.label}: ${val} siswa (${pct}%)`;
          },
        },
      },
    },
    cutout: '68%',
  };

  // Filtered Student List for Table
  const filteredRekap = useMemo(() => {
    if (!tableSearch.trim()) return rekapPerSiswa;
    const q = tableSearch.toLowerCase().trim();
    return rekapPerSiswa.filter(
      (s) =>
        s.namaLengkap.toLowerCase().includes(q) ||
        (s.nomorInduk && s.nomorInduk.toLowerCase().includes(q))
    );
  }, [rekapPerSiswa, tableSearch]);

  const handleExportExcel = () => {
    try {
      exportRekapToExcel(selectedBulan, selectedTahun, rekapPerSiswa, recordsBulanIni, institusi);
      onToast('Laporan Rekapitulasi Excel berhasil diunduh!', 'success');
    } catch (e) {
      console.error(e);
      onToast('Gagal membuat file Excel', 'error');
    }
  };

  const handleExportPdf = () => {
    try {
      exportRekapToPdf(selectedBulan, selectedTahun, rekapPerSiswa, recordsBulanIni, institusi);
      onToast('Laporan Rekapitulasi PDF resmi berhasil diunduh!', 'success');
    } catch (e) {
      console.error(e);
      onToast('Gagal membuat file PDF', 'error');
    }
  };

  const labelPeriode = getBulanTahunLabel(selectedBulan, selectedTahun);

  return (
    <div className="space-y-6">
      {/* Control Bar: Month, Year, and Export Buttons */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Month & Year Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Periode Laporan:
              </span>
            </div>

            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(Number(e.target.value))}
              className="px-3.5 py-2 text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {BULAN_INDONESIA.map((bulan, idx) => (
                <option key={bulan} value={idx + 1}>
                  {bulan}
                </option>
              ))}
            </select>

            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(Number(e.target.value))}
              className="px-3.5 py-2 text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {[2024, 2025, 2026, 2027, 2028].map((th) => (
                <option key={th} value={th}>
                  {th}
                </option>
              ))}
            </select>

            <span className="text-xs font-medium text-slate-500">
              ({recordsBulanIni.length} hari tercatat)
            </span>
          </div>

          {/* Action Export Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs transition-all active:scale-[0.98]"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor Excel (.xlsx)</span>
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-all active:scale-[0.98]"
            >
              <FileText className="w-4 h-4 text-rose-300" />
              <span>Ekspor PDF (.pdf)</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Hari Efektif & Tingkat Kehadiran */}
        <div className="col-span-2 lg:col-span-1 p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Tingkat Kehadiran
            </span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {totals.avgPct.toFixed(1)}%
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Dari {totals.totalHari} hari efektif presensi
            </p>
          </div>
        </div>

        {/* Card 2: Total Hadir */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Hadir
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-emerald-700 font-mono tabular-nums">
              {totals.totHadir}
            </span>
            <p className="text-xs text-slate-500 mt-1">Presensi hadir siswa</p>
          </div>
        </div>

        {/* Card 3: Total Izin */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Izin
            </span>
            <HelpCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-amber-700 font-mono tabular-nums">
              {totals.totIzin}
            </span>
            <p className="text-xs text-slate-500 mt-1">Surat / izin terdata</p>
          </div>
        </div>

        {/* Card 4: Total Sakit */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Sakit
            </span>
            <AlertTriangle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-blue-700 font-mono tabular-nums">
              {totals.totSakit}
            </span>
            <p className="text-xs text-slate-500 mt-1">Keterangan sakit</p>
          </div>
        </div>

        {/* Card 5: Total Alpha */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Alpha
            </span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-rose-700 font-mono tabular-nums">
              {totals.totAlpha}
            </span>
            <p className="text-xs text-slate-500 mt-1">Tanpa keterangan</p>
          </div>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Daily Trend in Month */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Grafik Batang: Rekapitulasi Presensi Harian
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sebaran Hadir, Izin, Sakit, dan Alpha per tanggal pada {labelPeriode}
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            {recordsBulanIni.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Belum ada data presensi pada bulan {labelPeriode}.
              </div>
            ) : (
              <Bar data={barChartData} options={barChartOptions} />
            )}
          </div>
        </div>

        {/* Doughnut Chart: Proportion */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col">
          <div className="flex flex-col gap-1 pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-base font-bold text-slate-900">
              Grafik Lingkaran: Proporsi Kehadiran
            </h3>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-slate-500">Pilih Tanggal:</span>
              <select
                value={selectedDateForDoughnut}
                onChange={(e) => setSelectedDateForDoughnut(e.target.value)}
                className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">Akumulasi Bulan Ini</option>
                {recordsBulanIni.map((r) => (
                  <option key={r.tanggal} value={r.tanggal}>
                    {r.tanggal}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {totals.grand === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Tidak ada data kehadiran.
              </div>
            ) : (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Student Attendance Matrix / Rekapitulasi Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Tabel Rekapitulasi Kehadiran Siswa
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Akumulasi kehadiran per siswa untuk periode {labelPeriode}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Cari siswa dalam rekap..."
              className="px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white w-full sm:w-60"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 w-28">NIS/NIP</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4 w-20 text-center text-emerald-700">Hadir</th>
                <th className="py-3 px-4 w-20 text-center text-amber-700">Izin</th>
                <th className="py-3 px-4 w-20 text-center text-blue-700">Sakit</th>
                <th className="py-3 px-4 w-20 text-center text-rose-700">Alpha</th>
                <th className="py-3 px-4 w-28 text-center">% Kehadiran</th>
                <th className="py-3 px-4 w-36 text-center">Predikat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRekap.map((sw, idx) => {
                let badgePredikat = (
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Sangat Baik
                  </span>
                );

                if (sw.persentaseHadir < 75) {
                  badgePredikat = (
                    <span className="text-xs font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Perlu Evaluasi
                    </span>
                  );
                } else if (sw.persentaseHadir < 85) {
                  badgePredikat = (
                    <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Cukup
                    </span>
                  );
                } else if (sw.persentaseHadir < 95) {
                  badgePredikat = (
                    <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      Baik
                    </span>
                  );
                }

                return (
                  <tr key={sw.idSiswa} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-center text-xs font-mono text-slate-400 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-500 tabular-nums">
                      {sw.nomorInduk || '-'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {sw.namaLengkap}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700 tabular-nums">
                      {sw.hadir}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-amber-700 tabular-nums">
                      {sw.izin}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-blue-700 tabular-nums">
                      {sw.sakit}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-rose-700 tabular-nums">
                      {sw.alpha}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800 tabular-nums">
                          {sw.persentaseHadir.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">{badgePredikat}</td>
                  </tr>
                );
              })}
            </tbody>
            {/* Table Footer Total Summary */}
            <tfoot className="bg-slate-100/80 border-t-2 border-slate-300 font-semibold text-slate-800 text-xs">
              <tr>
                <td colSpan={3} className="py-3 px-4 uppercase tracking-wider text-slate-700">
                  Total Rekapitulasi ({siswaList.length} Siswa)
                </td>
                <td className="py-3 px-4 text-center text-emerald-700 font-mono text-sm tabular-nums">
                  {totals.totHadir}
                </td>
                <td className="py-3 px-4 text-center text-amber-700 font-mono text-sm tabular-nums">
                  {totals.totIzin}
                </td>
                <td className="py-3 px-4 text-center text-blue-700 font-mono text-sm tabular-nums">
                  {totals.totSakit}
                </td>
                <td className="py-3 px-4 text-center text-rose-700 font-mono text-sm tabular-nums">
                  {totals.totAlpha}
                </td>
                <td className="py-3 px-4 text-center font-mono text-sm tabular-nums text-indigo-700">
                  {totals.avgPct.toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-center text-slate-400">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
