import { useState } from 'react';
import { pembayaranService } from '../services/apiService';

const PembayaranTab = ({ data, onRefresh }) => {
  const [filterStatus, setFilterStatus] = useState('semua');
  const [selectedBukti, setSelectedBukti] = useState(null);
  const [verifikasiModal, setVerifikasiModal] = useState(null);
  const [keterangan, setKeterangan] = useState('');
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status) => {
    if (status === 'lunas') return 'bg-green-100 text-green-800';
    if (status === 'terlambat') return 'bg-red-100 text-red-800';
    if (status === 'menunggu_verifikasi') return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const filtered = filterStatus === 'semua'
    ? data
    : data.filter(p => p.status === filterStatus);

  const terlambatCount = data.filter(p => p.status === 'terlambat').length;
  const menungguCount = data.filter(p => p.status === 'menunggu_verifikasi').length;

  const handleVerifikasi = async (setuju) => {
    try {
      setLoading(true);
      await pembayaranService.verifikasi(verifikasiModal.id, { setuju, keterangan });
      setVerifikasiModal(null);
      setKeterangan('');
      onRefresh();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <span className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm">{terlambatCount} terlambat</span>
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">{menungguCount} menunggu verifikasi</span>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b flex flex-wrap justify-between items-center gap-2">
          <h3 className="text-lg font-semibold">Daftar Tagihan</h3>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="semua">Semua status</option>
            <option value="belum_lunas">Belum Lunas</option>
            <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
            <option value="terlambat">Terlambat</option>
            <option value="lunas">Lunas</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penghuni</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bulan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jatuh Tempo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Tidak ada tagihan.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{p.nama_penghuni}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{p.bulan_tagihan}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">Rp {parseFloat(p.jumlah).toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{p.jatuh_tempo || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                    {p.bukti_bayar && (
                      <button
                        onClick={() => setSelectedBukti(p.bukti_bayar)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Lihat Bukti
                      </button>
                    )}
                    {p.status === 'menunggu_verifikasi' && (
                      <button
                        onClick={() => setVerifikasiModal(p)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Verifikasi
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBukti && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedBukti(null)}>
          <div className="bg-white rounded-lg p-4 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold">Bukti Pembayaran</h4>
              <button onClick={() => setSelectedBukti(null)} className="text-gray-500">✕</button>
            </div>
            <img src={selectedBukti} alt="Bukti bayar" className="w-full rounded" />
          </div>
        </div>
      )}

      {verifikasiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h4 className="font-semibold mb-4">Verifikasi Pembayaran</h4>
            {verifikasiModal.bukti_bayar && (
              <img src={verifikasiModal.bukti_bayar} alt="Bukti" className="w-full rounded mb-4 max-h-64 object-contain" />
            )}
            <p className="text-sm text-gray-600 mb-2">
              {verifikasiModal.nama_penghuni} — {verifikasiModal.bulan_tagihan} — Rp {parseFloat(verifikasiModal.jumlah).toLocaleString('id-ID')}
            </p>
            <textarea
              placeholder="Keterangan / alasan penolakan"
              value={keterangan}
              onChange={e => setKeterangan(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm mb-4"
              rows={2}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setVerifikasiModal(null)} disabled={loading} className="px-4 py-2 bg-gray-300 rounded text-sm">Batal</button>
              <button onClick={() => handleVerifikasi(false)} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded text-sm">Tolak</button>
              <button onClick={() => handleVerifikasi(true)} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded text-sm">Setujui</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PembayaranTab;