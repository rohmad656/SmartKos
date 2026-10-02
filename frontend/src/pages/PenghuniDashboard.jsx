import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PenghuniDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Penghuni</h1>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Logout</button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-lg">Halo, <span className="font-semibold">{user?.nama}</span>!</p>
        <p className="text-gray-600 mt-2">Peran: <span className="uppercase text-green-600 font-bold">{user?.role}</span></p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="bg-yellow-50 p-4 rounded border border-yellow-100">
            <h3 className="font-bold text-yellow-800">Tagihan Saya</h3>
            <p className="text-sm text-gray-600 mt-1">Lihat status pembayaran kos</p>
          </div>
          <div className="bg-orange-50 p-4 rounded border border-orange-100">
            <h3 className="font-bold text-orange-800">Lapor Perbaikan</h3>
            <p className="text-sm text-gray-600 mt-1">Kirim kendala fasilitas kamar</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PenghuniDashboard;