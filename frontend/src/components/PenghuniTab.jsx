import { useState } from 'react';
import { penghuniService, kamarService } from '../services/apiService';

const PenghuniTab = ({ data, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [kamars, setKamars] = useState([]);
  const [formData, setFormData] = useState({
    nama: '',
    kontak: '',
    email: '',
    kamar_id: '',
    tanggal_mulai: '',
    tanggal_selesai: ''
  });

  const handleOpenForm = async (penghuni = null) => {
    const kamarList = await kamarService.getAll();
    setKamars(kamarList);
    if (penghuni) {
      setFormData(penghuni);
      setEditingId(penghuni.id);
    } else {
      setFormData({ nama: '', kontak: '', email: '', kamar_id: '', tanggal_mulai: '', tanggal_selesai: '' });
      setEditingId(null);
    }
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await penghuniService.update(editingId, formData);
      } else {
        await penghuniService.create(formData);
      }
      setShowForm(false);
      onRefresh();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus penghuni ini?')) return;
    try {
      await penghuniService.delete(id);
      onRefresh();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Daftar Penghuni</h3>
        <button
          onClick={() => handleOpenForm()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          + Tambah Penghuni
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <h4 className="text-lg font-semibold mb-4">{editingId ? 'Edit Penghuni' : 'Tambah Penghuni'}</h4>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Nama"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
                required
              />
              <input
                type="tel"
                placeholder="Kontak"
                value={formData.kontak}
                onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              />
              <select
                value={formData.kamar_id}
                onChange={(e) => setFormData({ ...formData, kamar_id: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
                required
              >
                <option value="">Pilih Kamar</option>
                {kamars.map(k => (
                  <option key={k.id} value={k.id}>{k.nomor_kamar} - {k.tipe}</option>
                ))}
              </select>
              <input
                type="date"
                placeholder="Tanggal Mulai"
                value={formData.tanggal_mulai}
                onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
                required
              />
              <input
                type="date"
                placeholder="Tanggal Selesai"
                value={formData.tanggal_selesai}
                onChange={(e) => setFormData({ ...formData, tanggal_selesai: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              />
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kontak</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kamar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mulai</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map(penghuni => (
              <tr key={penghuni.id}>
                <td className="px-6 py-4 whitespace-nowrap">{penghuni.nama}</td>
                <td className="px-6 py-4 whitespace-nowrap">{penghuni.kontak}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{penghuni.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{penghuni.nomor_kamar}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{penghuni.tanggal_mulai}</td>
                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                  <button
                    onClick={() => handleOpenForm(penghuni)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(penghuni.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Hapus
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

export default PenghuniTab;
