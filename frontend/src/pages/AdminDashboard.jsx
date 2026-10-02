import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Logout</button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-lg">Selamat datang, <span className="font-semibold">{user?.nama}</span>!</p>
        <p className="text-gray-600 mt-2">Anda login sebagai <span className="uppercase text-blue-600 font-bold">{user?.role}</span></p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-blue-50 p-4 rounded border border-blue-100">
            <h3 className="font-bold text-blue-800">Kamar</h3>
            <p className="text-sm text-gray-600 mt-1">Kelola data kamar kos</p>
          </div>
          <div className="bg-green-50 p-4 rounded border border-green-100">
            <h3 className="font-bold text-green-800">Penghuni</h3>
            <p className="text-sm text-gray-600 mt-1">Kelola data penghuni aktif</p>
          </div>
          <div className="bg-purple-50 p-4 rounded border border-purple-100">
            <h3 className="font-bold text-purple-800">Tagihan</h3>
            <p className="text-sm text-gray-600 mt-1">Pantau pembayaran</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;