import { useState } from 'react';
import { pembayaranService } from '../services/apiService';

const PembayaranTab = ({ data, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    penghuni_id: '',
    bulan_tagihan: '',
    jumlah: '',
    status: 'belum_lunas'
  });

  const getStatusColor = (status) => {
    if (status === 'lunas') return 'bg-green-100 text-green-800';
    if (status === 'terlambat') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const handleOpenForm = (pembayaran = null) => {
    if (pembayaran) {
      setFormData(pembayaran);
      setEditingId(pembayaran.id);
    } else {
      setFormData({ penghuni_id: '', bulan_tagihan: '', jumlah: '', status: 'belum_lunas' });
      setEditingId(null);
    }
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await pembayaranService.update(editingId, formData);
      } else {
        await pembayaranService.create(formData);
      }
      setShowForm(false);
      onRefresh();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Riwayat Pembayaran</h3>
        <button
          onClick={() => handleOpenForm()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          + Tambah Tagihan
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <h4 className="text-lg font-semibold mb-4">{editingId ? 'Edit Tagihan' : 'Tambah Tagihan'}</h4>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Penghuni ID"
                value={formData.penghuni_id}
                onChange={(e) => setFormData({ ...formData, penghuni_id: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
                required
              />
              <input
                type="month"
                value={formData.bulan_tagihan}
                onChange={(e) => setFormData({ ...formData, bulan_tagihan: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
                required
              />
              <input
                type="number"
                placeholder="Jumlah"
                value={formData.jumlah}
                onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
                required
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="belum_lunas">Belum Lunas</option>
                <option value="lunas">Lunas</option>
                <option value="terlambat">Terlambat</option>
              </select>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penghuni</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bulan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map(p => (
              <tr key={p.id}>
                <td className="px-6 py-4 whitespace-nowrap">{p.nama_penghuni}</td>
                <td className="px-6 py-4 whitespace-nowrap">{p.bulan_tagihan}</td>
                <td className="px-6 py-4 whitespace-nowrap">Rp {parseFloat(p.jumlah).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(p.status)}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleOpenForm(p)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PembayaranTab;
