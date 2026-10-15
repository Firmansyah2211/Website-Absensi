export type StatusKehadiran = 'Hadir' | 'Izin' | 'Sakit' | 'Alpha';

export interface Siswa {
  id: string;
  namaLengkap: string;
  nomorInduk?: string; // NIS atau NIP
  kelompok?: string; // Kelas atau Departemen (e.g. "Kelas 12 IPA 1" atau "Divisi Operasional")
  aktif?: boolean;
}

export interface KehadiranItem {
  idSiswa: string;
  namaLengkap: string;
  status: StatusKehadiran;
  catatan?: string;
}

export interface AbsensiRecord {
  id: string;
  tanggal: string; // Format ISO: YYYY-MM-DD
  daftarKehadiran: KehadiranItem[];
  keterangan?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RingkasanKehadiran {
  totalSiswa: number;
  totalHadir: number;
  totalIzin: number;
  totalSakit: number;
  totalAlpha: number;
  persentaseHadir: number;
}

export interface RekapSiswaBulanan {
  idSiswa: string;
  namaLengkap: string;
  nomorInduk?: string;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
  totalHari: number;
  persentaseHadir: number;
}

export interface FilterLaporan {
  bulan: number; // 1-12
  tahun: number; // e.g. 2026
}

export type TabKey = 'input' | 'riwayat' | 'laporan' | 'siswa';
