import * as XLSX from 'xlsx';
import { AbsensiRecord, RekapSiswaBulanan, Siswa } from '../types/attendance';
import { formatTanggalIndonesia, getBulanTahunLabel } from './dateUtils';
import { InfoInstitusi } from './storage';

export function exportRekapToExcel(
  bulan: number,
  tahun: number,
  rekapList: RekapSiswaBulanan[],
  recordsBulanIni: AbsensiRecord[],
  institusi: InfoInstitusi
): void {
  const wb = XLSX.utils.book_new();
  const labelPeriode = getBulanTahunLabel(bulan, tahun);

  // 1. Sheet: Rekapitulasi Siswa
  const rekapData: (string | number)[][] = [
    ['LAPORAN REKAPITULASI PRESENSI SISWA'],
    [`Periode: ${labelPeriode}`],
    [`Institusi: ${institusi.namaInstansi}`],
    [`Kelas / Rombel: ${institusi.namaKelas}`],
    [`Penanggung Jawab: ${institusi.namaPenanggungJawab} (${institusi.jabatanPenanggungJawab})`],
    [], // empty row
    ['No', 'NIS / NIP', 'Nama Lengkap Siswa', 'Hadir (H)', 'Izin (I)', 'Sakit (S)', 'Alpha (A)', 'Total Hari', '% Kehadiran', 'Predikat Kehadiran'],
  ];

  let totalHadirSemua = 0;
  let totalIzinSemua = 0;
  let totalSakitSemua = 0;
  let totalAlphaSemua = 0;

  rekapList.forEach((sw, idx) => {
    totalHadirSemua += sw.hadir;
    totalIzinSemua += sw.izin;
    totalSakitSemua += sw.sakit;
    totalAlphaSemua += sw.alpha;

    let predikat = 'Sangat Baik';
    if (sw.persentaseHadir < 75) predikat = 'Perlu Perhatian Khusus';
    else if (sw.persentaseHadir < 85) predikat = 'Cukup';
    else if (sw.persentaseHadir < 95) predikat = 'Baik';

    rekapData.push([
      idx + 1,
      sw.nomorInduk || '-',
      sw.namaLengkap,
      sw.hadir,
      sw.izin,
      sw.sakit,
      sw.alpha,
      sw.totalHari,
      `${sw.persentaseHadir.toFixed(1)}%`,
      predikat,
    ]);
  });

  // Summary Row
  const totalSesi = recordsBulanIni.length;
  const grandTotal = totalHadirSemua + totalIzinSemua + totalSakitSemua + totalAlphaSemua;
  const avgPct = grandTotal > 0 ? ((totalHadirSemua / grandTotal) * 100).toFixed(1) : '0';

  rekapData.push([]);
  rekapData.push([
    'TOTAL REKAPITULASI',
    '',
    `${rekapList.length} Siswa Terdaftar (${totalSesi} Hari Efektif)`,
    totalHadirSemua,
    totalIzinSemua,
    totalSakitSemua,
    totalAlphaSemua,
    totalSesi,
    `${avgPct}% (Rata-rata)`,
    '-',
  ]);

  const wsRekap = XLSX.utils.aoa_to_sheet(rekapData);

  // Set column widths
  wsRekap['!cols'] = [
    { wch: 6 },  // No
    { wch: 14 }, // NIS
    { wch: 28 }, // Nama
    { wch: 10 }, // H
    { wch: 10 }, // I
    { wch: 10 }, // S
    { wch: 10 }, // A
    { wch: 12 }, // Total
    { wch: 14 }, // %
    { wch: 22 }, // Predikat
  ];

  XLSX.utils.book_append_sheet(wb, wsRekap, 'Rekap Siswa');

  // 2. Sheet: Log Harian Rinci
  const logData: (string | number)[][] = [
    ['LOG RINCIAN ABSENSI HARIAN'],
    [`Periode: ${labelPeriode}`],
    [],
    ['No', 'Tanggal', 'Hari & Tanggal', 'Nama Siswa', 'Status Kehadiran', 'Keterangan / Catatan'],
  ];

  let logCounter = 1;
  // Sort records by date ascending
  const sortedRecords = [...recordsBulanIni].sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  sortedRecords.forEach((rec) => {
    const formattedDate = formatTanggalIndonesia(rec.tanggal);
    rec.daftarKehadiran.forEach((item) => {
      logData.push([
        logCounter++,
        rec.tanggal,
        formattedDate,
        item.namaLengkap,
        item.status,
        item.catatan || '-',
      ]);
    });
  });

  const wsLog = XLSX.utils.aoa_to_sheet(logData);
  wsLog['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 26 },
    { wch: 28 },
    { wch: 16 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsLog, 'Log Harian Lengkap');

  // 3. Sheet: Ringkasan Per Tanggal
  const harianData: (string | number)[][] = [
    ['RINGKASAN KEHADIRAN PER TANGGAL'],
    [`Periode: ${labelPeriode}`],
    [],
    ['No', 'Tanggal', 'Format Tanggal', 'Total Siswa', 'Hadir', 'Izin', 'Sakit', 'Alpha', '% Hadir'],
  ];

  sortedRecords.forEach((rec, idx) => {
    const h = rec.daftarKehadiran.filter((k) => k.status === 'Hadir').length;
    const i = rec.daftarKehadiran.filter((k) => k.status === 'Izin').length;
    const s = rec.daftarKehadiran.filter((k) => k.status === 'Sakit').length;
    const a = rec.daftarKehadiran.filter((k) => k.status === 'Alpha').length;
    const tot = rec.daftarKehadiran.length;
    const pct = tot > 0 ? ((h / tot) * 100).toFixed(1) : '0';

    harianData.push([
      idx + 1,
      rec.tanggal,
      formatTanggalIndonesia(rec.tanggal),
      tot,
      h,
      i,
      s,
      a,
      `${pct}%`,
    ]);
  });

  const wsHarian = XLSX.utils.aoa_to_sheet(harianData);
  wsHarian['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 26 },
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, wsHarian, 'Rekap Per Tanggal');

  // Generate filename and trigger download
  const safeTitle = `AbsensiKU_${institusi.namaKelas.replace(/\s+/g, '_')}_${labelPeriode.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, safeTitle);
}

export function exportSingleDateToExcel(
  record: AbsensiRecord,
  siswaList: Siswa[],
  institusi: InfoInstitusi
): void {
  const wb = XLSX.utils.book_new();
  const formattedDate = formatTanggalIndonesia(record.tanggal);

  const data: (string | number)[][] = [
    ['LAPORAN PRESENSI HARIAN'],
    [`Tanggal: ${formattedDate} (${record.tanggal})`],
    [`Institusi: ${institusi.namaInstansi}`],
    [`Kelas / Kelompok: ${institusi.namaKelas}`],
    [`Keterangan: ${record.keterangan || '-'}`],
    [],
    ['No', 'NIS / NIP', 'Nama Lengkap Siswa', 'Status Kehadiran', 'Keterangan'],
  ];

  record.daftarKehadiran.forEach((item, idx) => {
    const sw = siswaList.find((s) => s.id === item.idSiswa);
    data.push([
      idx + 1,
      sw?.nomorInduk || '-',
      item.namaLengkap,
      item.status,
      item.catatan || '-',
    ]);
  });

  const hadir = record.daftarKehadiran.filter((k) => k.status === 'Hadir').length;
  const izin = record.daftarKehadiran.filter((k) => k.status === 'Izin').length;
  const sakit = record.daftarKehadiran.filter((k) => k.status === 'Sakit').length;
  const alpha = record.daftarKehadiran.filter((k) => k.status === 'Alpha').length;
  const tot = record.daftarKehadiran.length;
  const pct = tot > 0 ? ((hadir / tot) * 100).toFixed(1) : '0';

  data.push([]);
  data.push([
    'RINGKASAN:',
    `Hadir: ${hadir} | Izin: ${izin} | Sakit: ${sakit} | Alpha: ${alpha}`,
    `Total Siswa: ${tot}`,
    `Persentase Hadir: ${pct}%`,
  ]);

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 28 },
    { wch: 16 },
    { wch: 30 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Presensi Harian');
  XLSX.writeFile(wb, `Presensi_${record.tanggal}_${institusi.namaKelas.replace(/\s+/g, '_')}.xlsx`);
}
