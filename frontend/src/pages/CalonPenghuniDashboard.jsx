import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CalonPenghuniDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Area Calon Penghuni</h1>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Logout</button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-lg">Halo, <span className="font-semibold">{user?.nama}</span>!</p>
        <p className="text-gray-600 mt-2">Peran: <span className="uppercase text-purple-600 font-bold">{user?.role}</span></p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="bg-teal-50 p-4 rounded border border-teal-100">
            <h3 className="font-bold text-teal-800">Katalog Kamar</h3>
            <p className="text-sm text-gray-600 mt-1">Cari kamar kosong yang tersedia</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded border border-indigo-100">
            <h3 className="font-bold text-indigo-800">Jadwal Survei</h3>
            <p className="text-sm text-gray-600 mt-1">Atur jadwal survei kamar kos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalonPenghuniDashboard;