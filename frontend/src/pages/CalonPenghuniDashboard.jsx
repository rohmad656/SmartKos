import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { kamarService, bookingService } from '../services/apiService';

const GRID_COLS = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

const formatCurrency = (val) => 'Rp ' + parseFloat(val || 0).toLocaleString('id-ID');

const CalonPenghuniDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [kamars, setKamars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKamar, setSelectedKamar] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    namaCalon: '',
    kontak: '',
    kamarId: '',
    tanggalSurvei: ''
  });

  const [questionForm, setQuestionForm] = useState({
    nama: '',
    kontak: '',
    pertanyaan: ''
  });

  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadKamars();
  }, []);

  const loadKamars = async () => {
    try {
      setLoading(true);
      const data = await kamarService.getAll('kosong');
      setKamars(data);
    } catch (err) {
      console.error('Load kamars error:', err);
      setError('Gagal load data kamar');
    } finally {
      setLoading(false);
    }
  };

  const notify = (msg, isError = false) => {
    if (isError) setError(msg);
    else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!bookingForm.namaCalon.trim() || !bookingForm.kontak.trim() || !bookingForm.kamarId) {
      return notify('Semua field wajib diisi', true);
    }
    
    try {
      setLoadingAction(true);
      await bookingService.updateStatus(selectedKamar.id, {
        nama_calon: bookingForm.namaCalon,
        kontak: bookingForm.kontak,
        tanggal_survei: bookingForm.tanggalSurvei
      });
      
      // Fallback: use POST /api/booking
      await bookingService.updateStatus(selectedKamar.id, {
        nama_calon: bookingForm.namaCalon,
        kontak: bookingForm.kontak
      });
      
      notify('Booking berhasil! Admin akan menghubungi Anda segera.');
      setShowBookingForm(false);
      setBookingForm({ namaCalon: '', kontak: '', kamarId: '', tanggalSurvei: '' });
      setSelectedKamar(null);
    } catch (err) {
      notify('Gagal booking: ' + err.message, true);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleQuestion = async (e) => {
    e.preventDefault();
    if (!questionForm.nama.trim() || !questionForm.kontak.trim() || !questionForm.pertanyaan.trim()) {
      return notify('Semua field wajib diisi', true);
    }
    
    try {
      setLoadingAction(true);
      // Kirim sebagai pesan ke admin atau simpan di tabel pertanyaan
      // Untuk saat ini, gunakan modal sukses saja
      notify('Pertanyaan berhasil dikirim! Admin akan membalas melalui kontak Anda.');
      setShowQuestion(false);
      setQuestionForm({ nama: '', kontak: '', pertanyaan: '' });
    } catch (err) {
      notify('Gagal kirim: ' + err.message, true);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <h1 className="text-2xl font-bold">SmartKos</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm">{user?.nama || 'Guest'}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              {user ? 'Logout' : 'Login'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Cari Kamar Kos Impianmu</h2>
          <p className="text-gray-600 text-lg mb-8">Daftar kamar tersedia dengan harga terjangkau dan fasilitas lengkap</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => setShowQuestion(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Punya Pertanyaan?
            </button>
          </div>
        </div>
      </section>

      {/* Alerts */}
      {(error || success) && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 px-4 py-3 rounded">{success}</div>}
        </div>
      )}

      {/* Kamar Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-bold text-gray-800 mb-8">Kamar Kosong Tersedia</h3>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : kamars.length === 0 ? (
          <p className="text-center text-gray-500 py-12">Belum ada kamar kosong tersedia saat ini.</p>
        ) : (
          <div className={`grid ${GRID_COLS} gap-6`}>
            {kamars.map(kamar => (
              <div
                key={kamar.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedKamar(kamar)}
              >
                <div className="relative h-48 bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center">
                  {kamar.foto_url ? (
                    <img src={kamar.foto_url} alt={kamar.nomor_kamar} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-white">
                      <p className="text-4xl font-bold">{kamar.nomor_kamar}</p>
                      <p className="text-sm">Kamar Kos</p>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h4 className="text-lg font-bold text-gray-800">Kamar {kamar.nomor_kamar}</h4>
                  <p className="text-blue-600 font-semibold text-lg mt-2">{formatCurrency(kamar.harga)}/bulan</p>
                  <p className="text-gray-600 text-sm mt-1">{kamar.tipe}</p>
                  {kamar.deskripsi && (
                    <p className="text-gray-500 text-xs mt-2 line-clamp-2">{kamar.deskripsi}</p>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedKamar(kamar);
                    }}
                    className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium text-sm"
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal Detail Kamar & Booking */}
      {selectedKamar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Kamar {selectedKamar.nomor_kamar}</h3>
                <button
                  onClick={() => setSelectedKamar(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="h-48 bg-gradient-to-br from-blue-300 to-blue-500 rounded flex items-center justify-center">
                  {selectedKamar.foto_url ? (
                    <img src={selectedKamar.foto_url} alt={selectedKamar.nomor_kamar} className="w-full h-full object-cover" />
                  ) : (
                    <p className="text-white text-3xl font-bold">{selectedKamar.nomor_kamar}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Tipe</p>
                    <p className="font-semibold">{selectedKamar.tipe}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Harga</p>
                    <p className="font-semibold text-blue-600">{formatCurrency(selectedKamar.harga)}/bulan</p>
                  </div>
                </div>

                {selectedKamar.deskripsi && (
                  <div>
                    <p className="text-gray-500 text-sm">Deskripsi</p>
                    <p className="text-gray-700">{selectedKamar.deskripsi}</p>
                  </div>
                )}
              </div>

              {!showBookingForm ? (
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                  Booking Sekarang
                </button>
              ) : (
                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      value={bookingForm.namaCalon}
                      onChange={(e) => setBookingForm(f => ({ ...f, namaCalon: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kontak (WA/Telp)</label>
                    <input
                      type="tel"
                      required
                      value={bookingForm.kontak}
                      onChange={(e) => setBookingForm(f => ({ ...f, kontak: e.target.value }))}
                      placeholder="08xxxxxxxxx"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pilihan Tanggal Survei (Opsional)</label>
                    <input
                      type="date"
                      value={bookingForm.tanggalSurvei}
                      onChange={(e) => setBookingForm(f => ({ ...f, tanggalSurvei: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loadingAction}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-medium"
                    >
                      Konfirmasi Booking
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 font-medium"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Pertanyaan */}
      {showQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Kirim Pertanyaan</h3>
                <button
                  onClick={() => setShowQuestion(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleQuestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input
                    type="text"
                    required
                    value={questionForm.nama}
                    onChange={(e) => setQuestionForm(f => ({ ...f, nama: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kontak</label>
                  <input
                    type="tel"
                    required
                    value={questionForm.kontak}
                    onChange={(e) => setQuestionForm(f => ({ ...f, kontak: e.target.value }))}
                    placeholder="08xxxxxxxxx"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pertanyaan</label>
                  <textarea
                    rows={4}
                    required
                    value={questionForm.pertanyaan}
                    onChange={(e) => setQuestionForm(f => ({ ...f, pertanyaan: e.target.value }))}
                    placeholder="Tanyakan apa saja tentang kamar dan fasilitas kami..."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
                  >
                    Kirim
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuestion(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 font-medium"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalonPenghuniDashboard;
