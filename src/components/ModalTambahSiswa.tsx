import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';

interface ModalTambahSiswaProps {
  isOpen: boolean;
  defaultKelompok: string;
  onAdd: (nama: string, nomorInduk?: string, kelompok?: string) => void;
  onClose: () => void;
}

export const ModalTambahSiswa: React.FC<ModalTambahSiswaProps> = ({
  isOpen,
  defaultKelompok,
  onAdd,
  onClose,
}) => {
  const [nama, setNama] = useState('');
  const [nomorInduk, setNomorInduk] = useState('');
  const [kelompok, setKelompok] = useState(defaultKelompok);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setError('Nama lengkap wajib diisi');
      return;
    }
    onAdd(nama.trim(), nomorInduk.trim() || undefined, kelompok.trim() || undefined);
    setNama('');
    setNomorInduk('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Tambah Anggota / Siswa Baru</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => {
                setNama(e.target.value);
                if (error) setError('');
              }}
              placeholder="Contoh: Muhammad Farhan"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              autoFocus
            />
            {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nomor Induk (NIS / NIP)
            </label>
            <input
              type="text"
              value={nomorInduk}
              onChange={(e) => setNomorInduk(e.target.value)}
              placeholder="Contoh: 2026017 (Opsional)"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Kelas / Kelompok
            </label>
            <input
              type="text"
              value={kelompok}
              onChange={(e) => setKelompok(e.target.value)}
              placeholder="Contoh: Kelas XII IPA 1"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              Simpan Anggota
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
