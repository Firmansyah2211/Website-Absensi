import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AbsensiRecord,
  KehadiranItem,
  RekapSiswaBulanan,
  RingkasanKehadiran,
  Siswa,
  StatusKehadiran,
} from '../types/attendance';
import {
  generateSeedAbsensi,
  InfoInstitusi,
  loadAbsensiFromStorage,
  loadInstitusiFromStorage,
  loadSiswaFromStorage,
  saveAbsensiToStorage,
  saveInstitusiToStorage,
  saveSiswaToStorage,
} from '../utils/storage';

export function useAbsensi() {
  const [siswaList, setSiswaList] = useState<Siswa[]>(() => loadSiswaFromStorage());
  const [absensiList, setAbsensiList] = useState<AbsensiRecord[]>(() => {
    const initialSiswa = loadSiswaFromStorage();
    return loadAbsensiFromStorage(initialSiswa);
  });
  const [institusi, setInstitusi] = useState<InfoInstitusi>(() => loadInstitusiFromStorage());

  // Keep storage in sync
  useEffect(() => {
    saveSiswaToStorage(siswaList);
  }, [siswaList]);

  useEffect(() => {
    saveAbsensiToStorage(absensiList);
  }, [absensiList]);

  useEffect(() => {
    saveInstitusiToStorage(institusi);
  }, [institusi]);

  // Find attendance record by date
  const getAbsensiByTanggal = useCallback(
    (tanggal: string): AbsensiRecord | undefined => {
      return absensiList.find((r) => r.tanggal === tanggal);
    },
    [absensiList]
  );

  // Save or Update Attendance Record for a specific date
  const saveOrUpdateAbsensi = useCallback(
    (tanggal: string, daftarKehadiran: KehadiranItem[], keterangan?: string) => {
      const now = new Date().toISOString();
      setAbsensiList((prev) => {
        const existingIndex = prev.findIndex((r) => r.tanggal === tanggal);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            daftarKehadiran,
            keterangan: keterangan ?? updated[existingIndex].keterangan,
            updatedAt: now,
          };
          return updated;
        } else {
          const newRecord: AbsensiRecord = {
            id: `rec-${tanggal}-${Date.now()}`,
            tanggal,
            daftarKehadiran,
            keterangan: keterangan || `Presensi Harian ${tanggal}`,
            createdAt: now,
            updatedAt: now,
          };
          return [newRecord, ...prev];
        }
      });
    },
    []
  );

  // Delete attendance record
  const deleteAbsensi = useCallback((id: string) => {
    setAbsensiList((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Update a single student status within a date's record
  const updateStatusSiswaInRecord = useCallback(
    (recordId: string, idSiswa: string, newStatus: StatusKehadiran, catatan?: string) => {
      setAbsensiList((prev) =>
        prev.map((rec) => {
          if (rec.id !== recordId) return rec;
          const updatedDaftar = rec.daftarKehadiran.map((item) => {
            if (item.idSiswa !== idSiswa) return item;
            return {
              ...item,
              status: newStatus,
              catatan: catatan !== undefined ? catatan : item.catatan,
            };
          });
          return {
            ...rec,
            daftarKehadiran: updatedDaftar,
            updatedAt: new Date().toISOString(),
          };
        })
      );
    },
    []
  );

  // Add new student
  const addSiswa = useCallback(
    (namaLengkap: string, nomorInduk?: string, kelompok?: string) => {
      const trimmed = namaLengkap.trim();
      if (!trimmed) return null;

      const newId = `sw-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newSiswa: Siswa = {
        id: newId,
        namaLengkap: trimmed,
        nomorInduk: nomorInduk?.trim() || `2026${String(siswaList.length + 1).padStart(3, '0')}`,
        kelompok: kelompok?.trim() || institusi.namaKelas,
        aktif: true,
      };

      setSiswaList((prev) => [...prev, newSiswa]);
      return newSiswa;
    },
    [siswaList.length, institusi.namaKelas]
  );

  // Edit student
  const updateSiswa = useCallback((id: string, updatedFields: Partial<Siswa>) => {
    setSiswaList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
    );

    // Also synchronize full name in existing records if updated
    if (updatedFields.namaLengkap) {
      const newName = updatedFields.namaLengkap;
      setAbsensiList((prev) =>
        prev.map((rec) => ({
          ...rec,
          daftarKehadiran: rec.daftarKehadiran.map((item) =>
            item.idSiswa === id ? { ...item, namaLengkap: newName } : item
          ),
        }))
      );
    }
  }, []);

  // Delete student
  const deleteSiswa = useCallback((id: string) => {
    setSiswaList((prev) => prev.filter((s) => s.id !== id));
    // Remove from attendance records
    setAbsensiList((prev) =>
      prev.map((rec) => ({
        ...rec,
        daftarKehadiran: rec.daftarKehadiran.filter((item) => item.idSiswa !== id),
      }))
    );
  }, []);

  // Update Institution Info
  const updateInstitusi = useCallback((info: Partial<InfoInstitusi>) => {
    setInstitusi((prev) => ({ ...prev, ...info }));
  }, []);

  // Reset to default seed data
  const resetToSeedData = useCallback(() => {
    const defaultSiswa = loadSiswaFromStorage();
    const seeded = generateSeedAbsensi(defaultSiswa);
    setAbsensiList(seeded);
    saveAbsensiToStorage(seeded);
  }, []);

  // Get Monthly Summary for a specific month & year
  const getLaporanBulanan = useCallback(
    (bulan: number, tahun: number) => {
      const monthPrefix = `${tahun}-${String(bulan).padStart(2, '0')}`;
      const recordsBulan = absensiList.filter((r) => r.tanggal.startsWith(monthPrefix));

      const rekapPerSiswa: RekapSiswaBulanan[] = siswaList.map((sw) => {
        let hadir = 0;
        let izin = 0;
        let sakit = 0;
        let alpha = 0;

        recordsBulan.forEach((rec) => {
          const item = rec.daftarKehadiran.find((k) => k.idSiswa === sw.id);
          if (item) {
            if (item.status === 'Hadir') hadir++;
            else if (item.status === 'Izin') izin++;
            else if (item.status === 'Sakit') sakit++;
            else if (item.status === 'Alpha') alpha++;
          }
        });

        const totalHari = recordsBulan.length;
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

      // Overall monthly stats
      let totalHadirSemua = 0;
      let totalIzinSemua = 0;
      let totalSakitSemua = 0;
      let totalAlphaSemua = 0;

      rekapPerSiswa.forEach((sw) => {
        totalHadirSemua += sw.hadir;
        totalIzinSemua += sw.izin;
        totalSakitSemua += sw.sakit;
        totalAlphaSemua += sw.alpha;
      });

      const grandTotalKehadiran =
        totalHadirSemua + totalIzinSemua + totalSakitSemua + totalAlphaSemua;

      const ringkasan: RingkasanKehadiran = {
        totalSiswa: siswaList.length,
        totalHadir: totalHadirSemua,
        totalIzin: totalIzinSemua,
        totalSakit: totalSakitSemua,
        totalAlpha: totalAlphaSemua,
        persentaseHadir:
          grandTotalKehadiran > 0 ? (totalHadirSemua / grandTotalKehadiran) * 100 : 0,
      };

      return {
        records: recordsBulan,
        rekapPerSiswa,
        ringkasan,
      };
    },
    [absensiList, siswaList]
  );

  return {
    siswaList,
    absensiList,
    institusi,
    getAbsensiByTanggal,
    saveOrUpdateAbsensi,
    deleteAbsensi,
    updateStatusSiswaInRecord,
    addSiswa,
    updateSiswa,
    deleteSiswa,
    updateInstitusi,
    resetToSeedData,
    getLaporanBulanan,
  };
}
