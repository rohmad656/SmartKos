import { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';
import { bookingService } from '../services/apiService';

const BookingStatus = ({ booking, onRefresh }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(booking.batas_waktu).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft('Kedaluwarsa');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setTimeLeft(`Sisa ${days} hari ${hours} jam`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [booking.batas_waktu]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'menunggu': return 'bg-yellow-100 text-yellow-800';
      case 'dp_terkirim': return 'bg-blue-100 text-blue-800';
      case 'aktif': return 'bg-green-100 text-green-800';
      case 'kedaluwarsa': return 'bg-red-100 text-red-800';
      case 'ditolak': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUploadSuccess = (url) => {
    setUploadedFile(url);
  };

  const handleSubmitDP = async () => {
    if (!uploadedFile) {
      alert('Silakan upload bukti DP terlebih dahulu');
      return;
    }

    try {
      setUploading(true);
      const file = await fetch(uploadedFile).then(r => r.blob());
      await bookingService.uploadDPProof(booking.id, new File([file], 'bukti_dp.jpg'));
      onRefresh();
      setShowUploadForm(false);
      setUploadedFile(null);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (booking.status === 'kedaluwarsa') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Booking Kedaluwarsa</h3>
        <p className="text-red-600 text-sm mb-4">
          Maaf, waktu pembayaran DP Anda telah habis. Silakan ajukan booking ulang.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Ajukan Ulang
        </button>
      </div>
    );
  }

  if (booking.status === 'ditolak') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Booking Ditolak</h3>
        <p className="text-gray-600 text-sm">
          Maaf, booking Anda ditolak. Silakan hubungi admin untuk info lebih lanjut.
        </p>
      </div>
    );
  }

  if (booking.status === 'aktif') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Selamat! Booking Aktif</h3>
        <p className="text-green-600 text-sm">
          Anda sudah resmi menjadi penghuni. Silakan login sebagai penghuni.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">Status Booking: Kamar {booking.nomor_kamar}</h3>
          <span className={`inline-block mt-2 px-3 py-1 rounded text-sm font-medium ${getStatusBadge(booking.status)}`}>
            {booking.status}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-orange-600">{timeLeft}</p>
          <p className="text-xs text-gray-500">Batas: {new Date(booking.batas_waktu).toLocaleString('id-ID')}</p>
        </div>
      </div>

      {booking.status === 'menunggu' && (
        <div>
          <p className="text-gray-600 text-sm mb-4">
            Segera kirim bukti pembayaran DP untuk mengamankan kamar Anda.
          </p>
          {!showUploadForm ? (
            <button
              onClick={() => setShowUploadForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Upload Bukti DP
            </button>
          ) : (
            <div className="border-t pt-4">
              <ImageUpload
                onSuccess={handleUploadSuccess}
                onRemove={() => setUploadedFile(null)}
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmitDP}
                  disabled={uploading || !uploadedFile}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {uploading ? 'Mengirim...' : 'Kirim Bukti DP'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {booking.status === 'dp_terkirim' && (
        <div className="bg-blue-50 p-4 rounded">
          <p className="text-blue-700 text-sm">
            Bukti DP Anda sedang diverifikasi admin. Mohon tunggu.
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingStatus;
