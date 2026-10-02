import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { kamarService, penghuniService, pembayaranService, perbaikanService, pengumumanService, bookingService } from '../services/apiService';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ kosong: 0, terisi: 0, totalPemasukan: 0, penghuniBaru: 0 });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  const [penghuni, setPenghuni] = useState([]);
  const [pembayaran, setPembayaran] = useState([]);
  const [perbaikan, setPerbaikan] = useState([]);
  const [pengumuman, setPengumuman] = useState([]);
  const [booking, setBooking] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [kamars, penghuniData, pembayaranData, perbaikanData, pengumumanData, bookingData] = await Promise.all([
        kamarService.getAll(),
        penghuniService.getAll(),
        pembayaranService.getAll(),
        perbaikanService.getAll(),
        pengumumanService.getAll(),
        bookingService.getAll()
      ]);

      const kosong = kamars.filter(k => k.status === 'kosong').length;
      const terisi = kamars.filter(k => k.status === 'terisi').length;
      
      const thisMonth = new Date().toISOString().slice(0, 7);
      const totalPemasukan = pembayaranData
        .filter(p => p.bulan_tagihan === thisMonth && p.status === 'lunas')
        .reduce((sum, p) => sum + parseFloat(p.jumlah), 0);
      
      const penghuniBaru = penghuniData.filter(p => {
        const start = new Date(p.tanggal_mulai);
        return start.getMonth() === new Date().getMonth();
      }).length;

      setStats({ kosong, terisi, totalPemasukan, penghuniBaru });
      setPenghuni(penghuniData);
      setPembayaran(pembayaranData);
      setPerbaikan(perbaikanData);
      setPengumuman(pengumumanData);
      setBooking(bookingData);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePerbaikanUpdate = async (id, status) => {
    try {
      await perbaikanService.updateStatus(id, status);
      loadData();
    } catch (error) {
      alert('Gagal update status: ' + error.message);
    }
  };

  const handleBookingUpdate = async (id, status) => {
    try {
      await bookingService.updateStatus(id, status);
      loadData();
    } catch (error) {
      alert('Gagal update booking: ' + error.message);
    }
  };

  const handleDeletePengumuman = async (id) => {
    if (!confirm('Hapus pengumuman ini?')) return;
    try {
      await pengumumanService.delete(id);
      loadData();
    } catch (error) {
      alert('Gagal hapus: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'lunas') return 'bg-green-100 text-green-800';
    if (status === 'terlambat') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">SmartKos Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.nama}</span>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex border-b mb-6">
          {['dashboard', 'penghuni', 'pembayaran', 'perbaikan', 'pengumuman', 'booking'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize ${
                activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Kamar Kosong</p>
                <p className="text-3xl font-bold text-blue-600">{stats.kosong}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Kamar Terisi</p>
                <p className="text-3xl font-bold text-green-600">{stats.terisi}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Pemasukan Bulan Ini</p>
                <p className="text-3xl font-bold text-purple-600">Rp {stats.totalPemasukan.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Penghuni Baru</p>
                <p className="text-3xl font-bold text-orange-600">{stats.penghuniBaru}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'penghuni' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Daftar Penghuni</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kontak</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kamar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Mulai</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {penghuni.map(p => (
                    <tr key={p.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{p.nama}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{p.kontak}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{p.nomor_kamar || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{p.tanggal_mulai}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pembayaran' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Riwayat Pembayaran</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penghuni</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bulan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pembayaran.map(p => (
                    <tr key={p.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{p.nama_penghuni}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{p.bulan_tagihan}</td>
                      <td className="px-6 py-4 whitespace-nowrap">Rp {parseFloat(p.jumlah).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'perbaikan' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Laporan Perbaikan</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penghuni</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kamar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {perbaikan.map(p => (
                    <tr key={p.id}>
                      <td className="px-6 py-4">{p.nama_penghuni}</td>
                      <td className="px-6 py-4">{p.nomor_kamar}</td>
                      <td className="px-6 py-4">{p.deskripsi}</td>
                      <td className="px-6 py-4">{p.status}</td>
                      <td className="px-6 py-4">
                        <select
                          value={p.status}
                          onChange={(e) => handlePerbaikanUpdate(p.id, e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="proses">Proses</option>
                          <option value="selesai">Selesai</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pengumuman' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Pengumuman</h3>
            </div>
            <div className="p-4 space-y-4">
              {pengumuman.map(p => (
                <div key={p.id} className="border p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{p.judul}</h4>
                      <p className="text-sm text-gray-600 mt-1">{p.isi}</p>
                      <p className="text-xs text-gray-400 mt-2">Oleh: {p.dibuat_oleh_nama}</p>
                    </div>
                    <button
                      onClick={() => handleDeletePengumuman(p.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'booking' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Booking</h3>
            </div>
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
                  {booking.map(b => (
                    <tr key={b.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{b.nama_calon}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{b.kontak}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{b.nomor_kamar}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{b.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {b.status === 'menunggu' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleBookingUpdate(b.id, 'disetujui')}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => handleBookingUpdate(b.id, 'dibatalkan')}
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
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
