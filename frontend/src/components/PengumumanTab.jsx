import { useState } from 'react';
import { pengumumanService } from '../services/apiService';

const PengumumanTab = ({ data, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    judul: '',
    isi: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await pengumumanService.create(formData);
      setShowForm(false);
      setFormData({ judul: '', isi: '' });
      onRefresh();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus pengumuman ini?')) return;
    try {
      await pengumumanService.delete(id);
      onRefresh();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Pengumuman</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          + Buat Pengumuman
        </button>
      </div>

      {showForm && (
        <div className="p-4 border-b bg-blue-50">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Judul"
              value={formData.judul}
              onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm"
              required
            />
            <textarea
              placeholder="Isi Pengumuman"
              value={formData.isi}
              onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm"
              rows="4"
              required
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
                Posting
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="p-4 space-y-4">
        {data.map(p => (
          <div key={p.id} className="border p-4 rounded hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold">{p.judul}</h4>
                <p className="text-sm text-gray-600 mt-1">{p.isi}</p>
                <p className="text-xs text-gray-400 mt-2">Oleh: {p.dibuat_oleh_nama}</p>
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium ml-4"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PengumumanTab;
