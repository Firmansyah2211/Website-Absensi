import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AbsensiRecord, RekapSiswaBulanan, Siswa } from '../types/attendance';
import { formatTanggalIndonesia, formatTanggalPendek, getBulanTahunLabel } from './dateUtils';
import { InfoInstitusi } from './storage';

export function exportRekapToPdf(
  bulan: number,
  tahun: number,
  rekapList: RekapSiswaBulanan[],
  recordsBulanIni: AbsensiRecord[],
  institusi: InfoInstitusi
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const labelPeriode = getBulanTahunLabel(bulan, tahun);
  const totalHariEfektif = recordsBulanIni.length;

  // Header / Kop Dokumen
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, 210, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(institusi.namaInstansi.toUpperCase(), 105, 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Administrasi Presensi Kelas: ${institusi.namaKelas}`, 105, 25, { align: 'center' });

  // Divider line
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.6);
  doc.line(14, 28, 196, 28);

  // Judul Laporan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('LAPORAN REKAPITULASI PRESENSI SISWA', 105, 36, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Periode: ${labelPeriode}  |  Hari Efektif KBM: ${totalHariEfektif} Hari  |  Total Anggota: ${rekapList.length} Siswa`, 105, 41, { align: 'center' });

  // Calculate totals
  let totH = 0;
  let totI = 0;
  let totS = 0;
  let totA = 0;

  const tableBody = rekapList.map((sw, idx) => {
    totH += sw.hadir;
    totI += sw.izin;
    totS += sw.sakit;
    totA += sw.alpha;

    let predikat = 'Sangat Baik';
    if (sw.persentaseHadir < 75) predikat = 'Perlu Evaluasi';
    else if (sw.persentaseHadir < 85) predikat = 'Cukup';
    else if (sw.persentaseHadir < 95) predikat = 'Baik';

    return [
      (idx + 1).toString(),
      sw.nomorInduk || '-',
      sw.namaLengkap,
      sw.hadir.toString(),
      sw.izin.toString(),
      sw.sakit.toString(),
      sw.alpha.toString(),
      `${sw.persentaseHadir.toFixed(1)}%`,
      predikat,
    ];
  });

  const grandTotal = totH + totI + totS + totA;
  const avgPct = grandTotal > 0 ? ((totH / grandTotal) * 100).toFixed(1) : '0';

  // Summary row
  tableBody.push([
    '',
    '',
    'TOTAL REKAPITULASI KELAS',
    totH.toString(),
    totI.toString(),
    totS.toString(),
    totA.toString(),
    `${avgPct}%`,
    '-',
  ]);

  // Generate AutoTable
  autoTable(doc, {
    startY: 47,
    head: [
      ['No', 'NIS/NIP', 'Nama Lengkap', 'H', 'I', 'S', 'A', '% Hadir', 'Keterangan'],
    ],
    body: tableBody,
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 2.2,
      textColor: [30, 41, 59],
      valign: 'middle',
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 22, halign: 'center' },
      2: { cellWidth: 'auto', halign: 'left' },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 12, halign: 'center' },
      5: { cellWidth: 12, halign: 'center' },
      6: { cellWidth: 12, halign: 'center' },
      7: { cellWidth: 18, halign: 'center' },
      8: { cellWidth: 26, halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didParseCell: (data) => {
      // Highlight summary row
      if (data.row.index === tableBody.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [226, 232, 240];
      }
    },
  });

  // Tanda Tangan Section
  // @ts-expect-error jspdf-autotable adds lastAutoTable to doc
  const finalY = (doc.lastAutoTable?.finalY || 160) + 12;

  // Check if signature fits on current page
  let signY = finalY;
  if (signY > 240) {
    doc.addPage();
    signY = 25;
  }

  const todayStr = formatTanggalPendek(new Date().toISOString().split('T')[0]);

  // Left side signature / info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Keterangan Status:', 14, signY);
  doc.text('H: Hadir  |  I: Izin  |  S: Sakit  |  A: Alpha (Tanpa Keterangan)', 14, signY + 5);
  doc.text('Dicetak otomatis melalui AbsensiKU', 14, signY + 10);

  // Right side signature
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.text(`Kota Administrasi, ${todayStr}`, 140, signY);
  doc.text(institusi.jabatanPenanggungJawab, 140, signY + 5);

  doc.setFont('helvetica', 'bold');
  doc.text(institusi.namaPenanggungJawab, 140, signY + 28);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('NIP. 19780512 200501 2 004', 140, signY + 32);

  // Footer page numbers
  const pageCount = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Halaman ${i} dari ${pageCount}  •  AbsensiKU Sistem Presensi`, 105, 290, { align: 'center' });
  }

  doc.save(`Laporan_Presensi_${labelPeriode.replace(/\s+/g, '_')}.pdf`);
}

export function exportSingleDateToPdf(
  record: AbsensiRecord,
  siswaList: Siswa[],
  institusi: InfoInstitusi
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const formattedDate = formatTanggalIndonesia(record.tanggal);

  // Header / Kop Dokumen
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(institusi.namaInstansi.toUpperCase(), 105, 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Presensi Harian: ${institusi.namaKelas}`, 105, 25, { align: 'center' });

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.6);
  doc.line(14, 28, 196, 28);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('BERITA ACARA PRESENSI HARIAN', 105, 36, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Hari / Tanggal: ${formattedDate} (${record.tanggal})`, 105, 41, { align: 'center' });

  const h = record.daftarKehadiran.filter((k) => k.status === 'Hadir').length;
  const i = record.daftarKehadiran.filter((k) => k.status === 'Izin').length;
  const s = record.daftarKehadiran.filter((k) => k.status === 'Sakit').length;
  const a = record.daftarKehadiran.filter((k) => k.status === 'Alpha').length;
  const tot = record.daftarKehadiran.length;
  const pct = tot > 0 ? ((h / tot) * 100).toFixed(1) : '0';

  const tableBody = record.daftarKehadiran.map((item, idx) => {
    const sw = siswaList.find((st) => st.id === item.idSiswa);
    return [
      (idx + 1).toString(),
      sw?.nomorInduk || '-',
      item.namaLengkap,
      item.status,
      item.catatan || '-',
    ];
  });

  autoTable(doc, {
    startY: 47,
    head: [['No', 'NIS/NIP', 'Nama Lengkap', 'Status Kehadiran', 'Keterangan']],
    body: tableBody,
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 2.2,
      textColor: [30, 41, 59],
      valign: 'middle',
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 26, halign: 'center' },
      2: { cellWidth: 65, halign: 'left' },
      3: { cellWidth: 30, halign: 'center' },
      4: { cellWidth: 'auto', halign: 'left' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // @ts-expect-error jspdf-autotable adds lastAutoTable to doc
  const finalY = (doc.lastAutoTable?.finalY || 160) + 10;
  let signY = finalY;
  if (signY > 235) {
    doc.addPage();
    signY = 25;
  }

  // Summary block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(`Rekapitulasi: Hadir: ${h}  |  Izin: ${i}  |  Sakit: ${s}  |  Alpha: ${a}  (Kehadiran: ${pct}%)`, 14, signY);

  // Signature
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(institusi.jabatanPenanggungJawab, 140, signY + 6);
  doc.setFont('helvetica', 'bold');
  doc.text(institusi.namaPenanggungJawab, 140, signY + 28);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Petugas Presensi Harian', 140, signY + 32);

  doc.save(`Presensi_${record.tanggal}.pdf`);
}
