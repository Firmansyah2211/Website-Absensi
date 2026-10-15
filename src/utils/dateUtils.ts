export const BULAN_INDONESIA = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const HARI_INDONESIA = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTanggalIndonesia(tanggalIso: string): string {
  if (!tanggalIso) return '-';
  const parts = tanggalIso.split('-');
  if (parts.length !== 3) return tanggalIso;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return tanggalIso;

  const namaHari = HARI_INDONESIA[date.getDay()];
  const namaBulan = BULAN_INDONESIA[month];

  return `${namaHari}, ${day} ${namaBulan} ${year}`;
}

export function formatTanggalPendek(tanggalIso: string): string {
  if (!tanggalIso) return '-';
  const parts = tanggalIso.split('-');
  if (parts.length !== 3) return tanggalIso;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const namaBulan = BULAN_INDONESIA[month];
  return `${day} ${namaBulan} ${year}`;
}

export function getBulanTahunLabel(bulan: number, tahun: number): string {
  const namaBulan = BULAN_INDONESIA[bulan - 1] || '';
  return `${namaBulan} ${tahun}`;
}
