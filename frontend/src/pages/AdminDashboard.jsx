import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { kamarService, penghuniService, pembayaranService, perbaikanService, pengumumanService, bookingService } from '../services/apiService';
import KamarTab from '../components/KamarTab';
import PenghuniTab from '../components/PenghuniTab';
import PembayaranTab from '../components/PembayaranTab';
import PerbaikanTab from '../components/PerbaikanTab';
import PengumumanTab from '../components/PengumumanTab';
import BookingTab from '../components/BookingTab';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ kosong: 0, terisi: 0, totalPemasukan: 0, penghuniBaru: 0 });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  const [kamar, setKamar] = useState([]);
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
      setKamar(kamars);
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
          {['dashboard', 'kamar', 'penghuni', 'pembayaran', 'perbaikan', 'pengumuman', 'booking'].map(tab => (
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

        {activeTab === 'kamar' && <KamarTab data={kamar} onRefresh={loadData} />}

        {activeTab === 'penghuni' && <PenghuniTab data={penghuni} onRefresh={loadData} />}

        {activeTab === 'pembayaran' && <PembayaranTab data={pembayaran} onRefresh={loadData} />}

        {activeTab === 'perbaikan' && <PerbaikanTab data={perbaikan} onRefresh={loadData} />}

        {activeTab === 'pengumuman' && <PengumumanTab data={pengumuman} onRefresh={loadData} />}

        {activeTab === 'booking' && <BookingTab data={booking} onRefresh={loadData} />}
      </div>
    </div>
  );
};

export default AdminDashboard;
