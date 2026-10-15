import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Search,
  Building,
  Save,
  RotateCcw,
  Check,
} from 'lucide-react';
import { Siswa } from '../types/attendance';
import { InfoInstitusi } from '../utils/storage';
import { ModalTambahSiswa } from './ModalTambahSiswa';
import { ModalConfirm } from './ModalConfirm';

interface TabKelolaSiswaProps {
  siswaList: Siswa[];
  institusi: InfoInstitusi;
  onAddSiswa: (nama: string, nomorInduk?: string, kelompok?: string) => void;
  onUpdateSiswa: (id: string, updated: Partial<Siswa>) => void;
  onDeleteSiswa: (id: string) => void;
  onUpdateInstitusi: (info: Partial<InfoInstitusi>) => void;
  onResetSeedData: () => void;
  onToast: (msg: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export const TabKelolaSiswa: React.FC<TabKelolaSiswaProps> = ({
  siswaList,
  institusi,
  onAddSiswa,
  onUpdateSiswa,
  onDeleteSiswa,
  onUpdateInstitusi,
  onResetSeedData,
  onToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [siswaToDelete, setSiswaToDelete] = useState<Siswa | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Institution settings form state
  const [namaInstansi, setNamaInstansi] = useState(institusi.namaInstansi);
  const [namaKelas, setNamaKelas] = useState(institusi.namaKelas);
  const [namaPenanggungJawab, setNamaPenanggungJawab] = useState(institusi.namaPenanggungJawab);
  const [jabatanPenanggungJawab, setJabatanPenanggungJawab] = useState(institusi.jabatanPenanggungJawab);

  const filteredSiswa = siswaList.filter(
    (s) =>
      s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nomorInduk && s.nomorInduk.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSaveInstitusi = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateInstitusi({
      namaInstansi,
      namaKelas,
      namaPenanggungJawab,
      jabatanPenanggungJawab,
    });
    onToast('Informasi institusi dan kelas berhasil diperbarui!', 'success');
  };

  const handleSaveEditSiswa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSiswa) return;
    if (!editingSiswa.namaLengkap.trim()) {
      onToast('Nama siswa tidak boleh kosong', 'warning');
      return;
    }
    onUpdateSiswa(editingSiswa.id, {
      namaLengkap: editingSiswa.namaLengkap.trim(),
      nomorInduk: editingSiswa.nomorInduk?.trim(),
      kelompok: editingSiswa.kelompok?.trim(),
    });
    onToast(`Data ${editingSiswa.namaLengkap} berhasil diperbarui`, 'success');
    setEditingSiswa(null);
  };

  const confirmDeleteSiswa = () => {
    if (!siswaToDelete) return;
    onDeleteSiswa(siswaToDelete.id);
    onToast(`Siswa "${siswaToDelete.namaLengkap}" berhasil dihapus`, 'info');
    setSiswaToDelete(null);
  };

  const confirmResetData = () => {
    onResetSeedData();
    onToast('Data berhasil diatur ulang ke data percontohan awal', 'success');
  };

  return (
    <div className="space-y-6">
      {/* 2-Column Split: Student Management & Institution Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Master Data Siswa */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <h3 className="text-base font-bold text-slate-900">Daftar Anggota / Siswa</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total {siswaList.length} siswa terdaftar dalam sistem
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative flex-1 sm:w-52">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari siswa..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsModalAddOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tambah Siswa</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 w-32">NIS/NIP</th>
                  <th className="py-3 px-4">Nama Lengkap Siswa</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Kelas/Kelompok</th>
                  <th className="py-3 px-4 w-28 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSiswa.map((siswa, idx) => (
                  <tr key={siswa.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-center text-xs font-mono text-slate-400 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-600 tabular-nums">
                      {siswa.nomorInduk || '-'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {siswa.namaLengkap}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 hidden sm:table-cell">
                      {siswa.kelompok || institusi.namaKelas}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingSiswa(siswa)}
                          title="Edit Siswa"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSiswaToDelete(siswa)}
                          title="Hapus Siswa"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Institution Settings & Demo Tools */}
        <div className="space-y-6">
          {/* Institution Settings Form */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <Building className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Identitas Institusi & Kelas
              </h3>
            </div>

            <form onSubmit={handleSaveInstitusi} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Sekolah / Instansi
                </label>
                <input
                  type="text"
                  value={namaInstansi}
                  onChange={(e) => setNamaInstansi(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Kelas / Rombongan Belajar
                </label>
                <input
                  type="text"
                  value={namaKelas}
                  onChange={(e) => setNamaKelas(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Wali Kelas / Penanggung Jawab
                </label>
                <input
                  type="text"
                  value={namaPenanggungJawab}
                  onChange={(e) => setNamaPenanggungJawab(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Jabatan Penanggung Jawab
                </label>
                <input
                  type="text"
                  value={jabatanPenanggungJawab}
                  onChange={(e) => setJabatanPenanggungJawab(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan</span>
              </button>
            </form>
          </div>

          {/* Data Reset & Tools */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Pengelolaan & Cadangan Data
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Data disimpan otomatis di LocalStorage browser perangkat Anda. Gunakan opsi di bawah ini jika ingin memuat ulang dataset contoh presensi.
            </p>

            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Muat Ulang Data Contoh Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Add Student */}
      <ModalTambahSiswa
        isOpen={isModalAddOpen}
        defaultKelompok={institusi.namaKelas}
        onAdd={onAddSiswa}
        onClose={() => setIsModalAddOpen(false)}
      />

      {/* Modal Edit Student */}
      {editingSiswa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900">Edit Data Siswa</h3>
              <button
                onClick={() => setEditingSiswa(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEditSiswa} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  required
                  value={editingSiswa.namaLengkap}
                  onChange={(e) =>
                    setEditingSiswa({ ...editingSiswa, namaLengkap: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nomor Induk (NIS/NIP)
                </label>
                <input
                  type="text"
                  value={editingSiswa.nomorInduk || ''}
                  onChange={(e) =>
                    setEditingSiswa({ ...editingSiswa, nomorInduk: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Kelas / Kelompok
                </label>
                <input
                  type="text"
                  value={editingSiswa.kelompok || ''}
                  onChange={(e) =>
                    setEditingSiswa({ ...editingSiswa, kelompok: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSiswa(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete Student */}
      <ModalConfirm
        isOpen={Boolean(siswaToDelete)}
        title="Hapus Siswa dari Daftar?"
        message={
          siswaToDelete
            ? `Apakah Anda yakin ingin menghapus "${siswaToDelete.namaLengkap}"? Siswa ini juga akan dihapus dari catatan presensi harian.`
            : ''
        }
        confirmLabel="Hapus Siswa"
        cancelLabel="Batal"
        isDanger={true}
        onConfirm={confirmDeleteSiswa}
        onClose={() => setSiswaToDelete(null)}
      />

      {/* Modal Confirm Reset Seed Data */}
      <ModalConfirm
        isOpen={isResetConfirmOpen}
        title="Muat Ulang Data Contoh?"
        message="Tindakan ini akan mengembalikan data presensi dan daftar siswa ke data contoh bawaan untuk keperluan demo pengujian."
        confirmLabel="Muat Ulang Contoh"
        cancelLabel="Batal"
        isDanger={false}
        onConfirm={confirmResetData}
        onClose={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
