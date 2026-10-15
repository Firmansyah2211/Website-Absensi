import { AbsensiRecord, Siswa, StatusKehadiran } from '../types/attendance';

export const STORAGE_KEYS = {
  SISWA: 'absensiku_siswa_v1',
  ABSENSI: 'absensiku_absensi_v1',
  INSTITUSI: 'absensiku_institusi_v1',
};

export const INITIAL_SISWA: Siswa[] = [
  { id: 'sw-01', namaLengkap: 'Ahmad Fauzi', nomorInduk: '2026001', kelompok: 'Kelas XII IPA 1' },
  { id: 'sw-02', namaLengkap: 'Budi Santoso', nomorInduk: '2026002', kelompok: 'Kelas XII IPA 1' },
  { id: 'sw-03', namaLengkap: 'Citra Lestari', nomorInduk: '2026003', kelompok: 'Kelas XII IPA 1' },
  { id: 'sw-04', namaLengkap: 'Dewi Ayu Anggraini', nomorInduk: '2026004', kelompok: 'Kelas XII IPA 1' },
  { id: 'sw-05', namaLengkap: 'Eko Prasetyo', nomorInduk: '2026005', kelompok: 'Kelas XII IPA 1' },
  { id: 'sw-06', namaLengkap: 'Farhan Ramadhan', nomorInduk: '2026006', kelompok: 'Kelas XII IPA 1' },
  { id: 'sw-07', namaLengkap: 'Gita Permata', nomorInduk: '2026007', kelompok: 'Kelas XII IPA 1' },
  { id: 'sw-08', namaLengkap: 'Hendra Gunawan', nomorInduk: '2026008', kelompok: 'Kelas XII IPA 1' },
  { id: 'sw-09', namaLengkap: 'Indah Wulandari', nomorInduk: '2026009', kelompok: 'Kelas XII IPA 1' },
  { id: 'sw-10', namaLengkap: 'Joko Susilo', nomorInduk: '2026010', kelompok: 'Kelas XII IPA 1' },
  { id: 'sw-11', namaLengkap: 'Kartika Sari', nomorInduk: '2026011', kelompok: 'Kelas XII IPA 1' },
  { id: 'sw-12', namaLengkap: 'Lutfi Hakim', nomorInduk: '2026012', kelompok: 'Kelas XII IPA 1' },
  { id: 'sw-13', namaLengkap: 'Maya Anggraini', nomorInduk: '2026013', kelompok: 'Kelas XII IPA 1' },
  { id: 'sw-14', namaLengkap: 'Nanda Pratama', nomorInduk: '2026014', kelompok: 'Kelas XII IPA 1' },
  { id: 'sw-15', namaLengkap: 'Putri Maharani', nomorInduk: '2026015', kelompok: 'Kelas XII IPA 1' },
  { id: 'sw-16', namaLengkap: 'Rizky Firmansyah', nomorInduk: '2026016', kelompok: 'Kelas XII IPA 1' },
];

export interface InfoInstitusi {
  namaInstansi: string;
  namaKelas: string;
  namaPenanggungJawab: string;
  jabatanPenanggungJawab: string;
}

export const INITIAL_INSTITUSI: InfoInstitusi = {
  namaInstansi: 'SMA Negeri 1 Prestasi Nusantara',
  namaKelas: 'Kelas XII IPA 1',
  namaPenanggungJawab: 'Dra. Hj. Nurjanah, M.Pd.',
  jabatanPenanggungJawab: 'Wali Kelas XII IPA 1',
};

// Generate realistic past attendance records based on current date
export function generateSeedAbsensi(siswaList: Siswa[]): AbsensiRecord[] {
  const records: AbsensiRecord[] = [];
  const today = new Date();

  // Create attendance for the last 6 working days
  for (let offset = 6; offset >= 1; offset--) {
    const d = new Date(today);
    d.setDate(today.getDate() - offset);

    // Skip Sundays (0) and Saturdays (6)
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    const isoDate = `${y}-${m}-${dayStr}`;

    const daftar = siswaList.map((sw, idx) => {
      let status: StatusKehadiran = 'Hadir';
      let catatan = '';

      // Add a couple of realistic deviations
      if ((offset + idx) % 9 === 0) {
        status = 'Izin';
        catatan = 'Keperluan keluarga';
      } else if ((offset * 2 + idx) % 13 === 0) {
        status = 'Sakit';
        catatan = 'Demam dan flu';
      } else if (offset === 3 && idx === 7) {
        status = 'Alpha';
        catatan = 'Tanpa konfirmasi';
      }

      return {
        idSiswa: sw.id,
        namaLengkap: sw.namaLengkap,
        status,
        catatan,
      };
    });

    records.push({
      id: `rec-${isoDate}`,
      tanggal: isoDate,
      daftarKehadiran: daftar,
      keterangan: `Presensi KBM Harian - ${isoDate}`,
      createdAt: d.toISOString(),
      updatedAt: d.toISOString(),
    });
  }

  return records;
}

export function loadSiswaFromStorage(): Siswa[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SISWA);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(INITIAL_SISWA));
      return INITIAL_SISWA;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SISWA;
  } catch (e) {
    console.error('Failed to load siswa from storage:', e);
    return INITIAL_SISWA;
  }
}

export function saveSiswaToStorage(siswa: Siswa[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(siswa));
  } catch (e) {
    console.error('Failed to save siswa to storage:', e);
  }
}

export function loadAbsensiFromStorage(siswaList: Siswa[]): AbsensiRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ABSENSI);
    if (!raw) {
      const seeded = generateSeedAbsensi(siswaList);
      localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load absensi from storage:', e);
    return [];
  }
}

export function saveAbsensiToStorage(records: AbsensiRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save absensi to storage:', e);
  }
}

export function loadInstitusiFromStorage(): InfoInstitusi {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INSTITUSI);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INSTITUSI, JSON.stringify(INITIAL_INSTITUSI));
      return INITIAL_INSTITUSI;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_INSTITUSI;
  }
}

export function saveInstitusiToStorage(info: InfoInstitusi): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INSTITUSI, JSON.stringify(info));
  } catch (e) {
    console.error('Failed to save institusi to storage:', e);
  }
}
