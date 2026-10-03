import { useState, useEffect } from 'react';
import { bookingService } from '../services/apiService';

const CountdownTimer = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(deadline).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft('Kedaluwarsa');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${days}h ${hours}j ${minutes}m`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);

    return () => clearInterval(interval);
  }, [deadline]);

  return <span className="text-xs text-gray-500">{timeLeft}</span>;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'menunggu': return 'bg-yellow-100 text-yellow-800';
    case 'dp_terkirim': return 'bg-blue-100 text-blue-800';
    case 'aktif': return 'bg-green-100 text-green-800';
    case 'kedaluwarsa': return 'bg-red-100 text-red-800';
    case 'ditolak': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const BookingTab = ({ data, onRefresh }) => {
  const [showSurveiModal, setShowSurveiModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [tanggalSurvei, setTanggalSurvei] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [verifying, setVerifying] = useState(false);

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

  const handleVerify = async (approve) => {
    try {
      setVerifying(true);
      await bookingService.verifyBooking(selectedBooking.id, approve);
      setShowVerifyModal(false);
      setSelectedBooking(null);
      onRefresh();
      alert(approve ? 'Booking berhasil diverifikasi. Penghuni dibuat!' : 'Booking ditolak.');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setVerifying(false);
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

      {showVerifyModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
            <h4 className="text-lg font-semibold mb-4">Verifikasi Bukti DP</h4>
            <div className="mb-4 space-y-2">
              <p className="text-sm"><span className="font-medium">Calon:</span> {selectedBooking.nama_calon}</p>
              <p className="text-sm"><span className="font-medium">Kontak:</span> {selectedBooking.kontak}</p>
              <p className="text-sm"><span className="font-medium">Kamar:</span> {selectedBooking.nomor_kamar}</p>
            </div>
            {selectedBooking.bukti_dp && (
              <div className="mb-4">
                <img
                  src={selectedBooking.bukti_dp.startsWith('http') ? selectedBooking.bukti_dp : `https://your-storage-url/${selectedBooking.bukti_dp}`}
                  alt="Bukti DP"
                  className="w-full max-h-64 object-contain border rounded"
                />
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowVerifyModal(false)}
                disabled={verifying}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
              >
                Batal
              </button>
              <button
                onClick={() => handleVerify(false)}
                disabled={verifying}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Tolak
              </button>
              <button
                onClick={() => handleVerify(true)}
                disabled={verifying}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                {verifying ? 'Memproses...' : 'Setujui & Jadikan Penghuni'}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batas Waktu</th>
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
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(b.status)}`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {b.batas_waktu && <CountdownTimer deadline={b.batas_waktu} />}
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
                        onClick={() => handleStatusUpdate(b.id, 'ditolak')}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Tolak
                      </button>
                    </div>
                  )}
                  {b.status === 'dp_terkirim' && (
                    <button
                      onClick={() => {
                        setSelectedBooking(b);
                        setShowVerifyModal(true);
                      }}
                      className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                    >
                      Verifikasi DP
                    </button>
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
