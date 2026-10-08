import { useState } from 'react';
import { kamarService } from '../services/apiService';
import ImageUpload from './ImageUpload';

const KamarTab = ({ data, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nomor_kamar: '',
    tipe: '',
    harga: '',
    status: 'kosong',
    deskripsi: '',
    foto_url: ''
  });
  const [isExistingImage, setIsExistingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenForm = (kamar = null) => {
    if (kamar) {
      setFormData(kamar);
      setEditingId(kamar.id);
      setIsExistingImage(!!kamar.foto_url);
    } else {
      setFormData({ nomor_kamar: '', tipe: '', harga: '', status: 'kosong', deskripsi: '', foto_url: '' });
      setEditingId(null);
      setIsExistingImage(false);
    }
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        nomorKamar: formData.nomor_kamar,
        tipe: formData.tipe,
        harga: parseFloat(formData.harga),
        status: formData.status,
        deskripsi: formData.deskripsi,
        fotoUrl: formData.foto_url
      };

      if (editingId) {
        await kamarService.update(editingId, payload);
      } else {
        await kamarService.create(payload);
      }
      setShowForm(false);
      onRefresh();
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Terjadi kesalahan';
      alert('Error: ' + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus kamar ini?')) return;
    try {
      await kamarService.delete(id);
      onRefresh();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, foto_url: '' }));
    setIsExistingImage(false);
  };

  const handleImageUploadSuccess = (url) => {
    setFormData(prev => ({ ...prev, foto_url: url }));
    setIsExistingImage(false);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Daftar Kamar</h3>
        <button
          onClick={() => handleOpenForm()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          + Tambah Kamar
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h4 className="text-lg font-semibold mb-4">{editingId ? 'Edit Kamar' : 'Tambah Kamar'}</h4>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Nomor Kamar"
                value={formData.nomor_kamar}
                onChange={(e) => setFormData({ ...formData, nomor_kamar: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
                required
              />
              <input
                type="text"
                placeholder="Tipe (VIP, Standard, dll)"
                value={formData.tipe}
                onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
                required
              />
              <input
                type="number"
                placeholder="Harga"
                value={formData.harga}
                onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
                required
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="kosong">Kosong</option>
                <option value="terisi">Terisi</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <textarea
                placeholder="Deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
                rows="3"
              />
              <div className="border-t pt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Foto Kamar</label>
                {isExistingImage ? (
                  <div className="relative mb-3">
                    <img
                      src={formData.foto_url}
                      alt="Kamar preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Ganti Foto
                    </button>
                  </div>
                ) : null}
                {!isExistingImage && (
                  <ImageUpload
                    onSuccess={handleImageUploadSuccess}
                    onRemove={handleRemoveImage}
                    existingUrl={formData.foto_url}
                    maxSizeMB={5}
                    allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
                  />
                )}
              </div>
              <div className="flex gap-2 justify-end border-t pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Kamar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map(kamar => (
              <tr key={kamar.id}>
                <td className="px-6 py-4 whitespace-nowrap">{kamar.nomor_kamar}</td>
                <td className="px-6 py-4 whitespace-nowrap">{kamar.tipe}</td>
                <td className="px-6 py-4 whitespace-nowrap">Rp {parseFloat(kamar.harga).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    kamar.status === 'kosong' ? 'bg-green-100 text-green-800' :
                    kamar.status === 'terisi' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {kamar.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                  <button
                    onClick={() => handleOpenForm(kamar)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(kamar.id)}
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

export default KamarTab;
