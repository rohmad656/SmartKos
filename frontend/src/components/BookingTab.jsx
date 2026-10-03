import { useState } from 'react';
import { bookingService } from '../services/apiService';

const BookingTab = ({ data, onRefresh }) => {
  const [showSurveiModal, setShowSurveiModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [tanggalSurvei, setTanggalSurvei] = useState('');

  const handleStatusUpdate = async (id, status) => {
    try {
      await bookingService.updateStatus(id, status);
      onRefresh();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleSetSurvei = async () => {
    try {
      await bookingService.setSurvei(selectedBookingId, tanggalSurvei);
      setShowSurveiModal(false);
      setTanggalSurvei('');
      onRefresh();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Booking Kamar</h3>
      </div>

      {showSurveiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h4 className="text-lg font-semibold mb-4">Atur Tanggal Survei</h4>
            <input
              type="date"
              value={tanggalSurvei}
              onChange={(e) => setTanggalSurvei(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm mb-4"
              required
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSurveiModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleSetSurvei}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kontak</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kamar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map(b => (
              <tr key={b.id}>
                <td className="px-6 py-4 whitespace-nowrap">{b.nama_calon}</td>
                <td className="px-6 py-4 whitespace-nowrap">{b.kontak}</td>
                <td className="px-6 py-4 whitespace-nowrap">{b.nomor_kamar}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    b.status === 'disetujui' ? 'bg-green-100 text-green-800' :
                    b.status === 'dibatalkan' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {b.status === 'menunggu' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedBookingId(b.id);
                          setShowSurveiModal(true);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Survei
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(b.id, 'disetujui')}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Setujui
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(b.id, 'dibatalkan')}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Tolak
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingTab;
