import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  pembayaranService,
  perbaikanService,
  pengumumanService,
  pesanService
} from '../services/apiService';
import api from '../services/authService';

const TABS = ['profil', 'pembayaran', 'perbaikan', 'pengumuman', 'pesan'];

const badgeColor = (status) => {
  if (status === 'lunas') return 'bg-green-100 text-green-800';
  if (status === 'terlambat') return 'bg-red-100 text-red-800';
  return 'bg-yellow-100 text-yellow-800';
};

const statusPerbaikanColor = (status) => {
  if (status === 'selesai') return 'bg-green-100 text-green-800';
  if (status === 'proses') return 'bg-blue-100 text-blue-800';
  return 'bg-gray-100 text-gray-800';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatCurrency = (val) => {
  return 'Rp ' + parseFloat(val || 0).toLocaleString('id-ID');
};

const durasiKontrak = (mulai, selesai) => {
  if (!mulai) return '-';
  const a = new Date(mulai);
  const b = selesai ? new Date(selesai) : new Date();
  const months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  return months <= 0 ? '< 1 bulan' : `${months} bulan`;
};

const PenghuniDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profil');
  const [loading, setLoading] = useState(true);

  const [profil, setProfil] = useState(null);
  const [pembayaran, setPembayaran] = useState([]);
  const [perbaikan, setPerbaikan] = useState([]);
  const [pengumuman, setPengumuman] = useState([]);
  const [pesans, setPesans] = useState([]);

  const [form, setForm] = useState({ deskripsi: '', kamarId: '' });
  const [pesanText, setPesanText] = useState('');
  const [adminId, setAdminId] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [pembayaranData, perbaikanData, pengumumanData] = await Promise.all([
        pembayaranService.getAll(),
        perbaikanService.getAll(),
        pengumumanService.getAll()
      ]);
      setPembayaran(pembayaranData);
      setPerbaikan(perbaikanData);
      setPengumuman(pengumumanData);
    } catch (err) {
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProfil = useCallback(async () => {
    if (!user?.penghuni_id) return;
    try {
      const { data } = await api.get(`/penghuni/${user.penghuni_id}`);
      setProfil(data.data);
    } catch (err) {
      console.error('Load profil error:', err);
    }
  }, [user]);

  const loadPesan = useCallback(async () => {
    try {
      const data = await pesanService.getConversation();
      setPesans(data);
    } catch (err) {
      console.error('Load pesan error:', err);
    }
  }, []);

  const findAdmin = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (pesans.length > 0) {
        const otherUser = pesans.find(p => p.pengirim_id !== user?.id);
        if (otherUser) setAdminId(otherUser.pengirim_id);
      }
    } catch (err) {
      console.error('Find admin error:', err);
    }
  }, [pesans, user]);

  useEffect(() => {
    loadProfil();
    loadData();
    loadPesan();
  }, [loadProfil, loadData, loadPesan]);

  useEffect(() => {
    if (pesans.length) findAdmin();
  }, [pesans, findAdmin]);

  const notify = (msg, isError = false) => {
    if (isError) setError(msg);
    else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBayar = async (id) => {
    if (!confirm('Konfirmasi pembayaran?')) return;
    try {
      setLoadingAction(true);
      await pembayaranService.bayar(id);
      await loadData();
      notify('Pembayaran berhasil dicatat!');
    } catch (err) {
      notify(err.message, true);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLaporPerbaikan = async (e) => {
    e.preventDefault();
    if (!form.deskripsi.trim()) return notify('Deskripsi wajib diisi', true);
    try {
      setLoadingAction(true);
      await perbaikanService.create({
        deskripsi: form.deskripsi,
        kamarId: profil?.kamar_id || null
      });
      setForm({ deskripsi: '', kamarId: '' });
      await loadData();
      notify('Laporan berhasil dikirim!');
    } catch (err) {
      notify(err.message, true);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleKirimPesan = async (e) => {
    e.preventDefault();
    if (!pesanText.trim()) return notify('Pesan tidak boleh kosong', true);
    if (!adminId) return notify('Admin ID tidak ditemukan', true);
    try {
      setLoadingAction(true);
      await pesanService.send(adminId, pesanText);
      setPesanText('');
      await loadPesan();
    } catch (err) {
      notify(err.message, true);
    } finally {
      setLoadingAction(false);
    }
  };

  const thisMonth = new Date().toISOString().slice(0, 7);
  const tagiBulanIni = pembayaran.find(p => p.bulan_tagihan === thisMonth && p.status !== 'lunas');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-800">SmartKos Penghuni</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.nama}</span>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(error || success) && (
          <div className={`mb-4 px-4 py-3 rounded ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {error || success}
          </div>
        )}

        <div className="flex border-b mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize whitespace-nowrap ${
                activeTab === tab
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'profil' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Profil Saya</h2>
            {profil ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-2xl font-bold text-green-600 mr-4">
                      {profil.nama?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xl font-semibold">{profil.nama}</p>
                      <p className="text-gray-500 text-sm">Penghuni Aktif</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Kontak</span>
                      <span className="font-medium">{profil.kontak}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Email</span>
                      <span className="font-medium">{profil.email || '-'}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-600 text-sm font-medium">Nomor Kamar</p>
                    <p className="text-2xl font-bold text-blue-800">{profil.nomor_kamar || '-'}</p>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Mulai Kontrak</span>
                    <span className="font-medium">{formatDate(profil.tanggal_mulai)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Selesai Kontrak</span>
                    <span className="font-medium">{formatDate(profil.tanggal_selesai)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Durasi</span>
                    <span className="font-medium text-green-600">{durasiKontrak(profil.tanggal_mulai, profil.tanggal_selesai)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Data profil tidak tersedia.</p>
            )}
          </div>
        )}

        {activeTab === 'pembayaran' && (
          <div className="space-y-6">
            {tagiBulanIni && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="font-semibold text-yellow-800">Tagihan Bulan Ini ({tagiBulanIni.bulan_tagihan})</p>
                  <p className="text-2xl font-bold text-yellow-900">{formatCurrency(tagiBulanIni.jumlah)}</p>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${badgeColor(tagiBulanIni.status)}`}>
                    {tagiBulanIni.status}
                  </span>
                </div>
                <button
                  onClick={() => handleBayar(tagiBulanIni.id)}
                  disabled={loadingAction}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  Bayar Sekarang
                </button>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Riwayat Pembayaran</h3>
              </div>
              {pembayaran.length === 0 ? (
                <p className="p-6 text-gray-500 text-center">Belum ada riwayat pembayaran.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bulan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Bayar</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pembayaran.map(p => (
                        <tr key={p.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{p.bulan_tagihan}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(p.jumlah)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${badgeColor(p.status)}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{formatDate(p.tanggal_bayar)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'perbaikan' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Buat Laporan Perbaikan</h3>
              <form onSubmit={handleLaporPerbaikan} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Masalah</label>
                  <textarea
                    rows={3}
                    value={form.deskripsi}
                    onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))}
                    placeholder="Jelaskan masalah yang perlu diperbaiki..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  Kirim Laporan
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Status Laporan Saya</h3>
              </div>
              {perbaikan.length === 0 ? (
                <p className="p-6 text-gray-500 text-center">Belum ada laporan.</p>
              ) : (
                <div className="divide-y">
                  {perbaikan.map(p => (
                    <div key={p.id} className="p-4 flex justify-between items-start gap-4">
                      <div>
                        <p className="font-medium">{p.deskripsi}</p>
                        <p className="text-sm text-gray-500 mt-1">{formatDate(p.created_at)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${statusPerbaikanColor(p.status)}`}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'pengumuman' && (
          <div className="bg-white rounded-lg shadow divide-y">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Pengumuman dari Admin</h3>
            </div>
            {pengumuman.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">Belum ada pengumuman.</p>
            ) : (
              pengumuman.map(p => (
                <div key={p.id} className="p-5">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-gray-800">{p.judul}</h4>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{formatDate(p.created_at)}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{p.isi}</p>
                  <p className="text-xs text-gray-400 mt-2">Oleh: {p.dibuat_oleh_nama}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'pesan' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Pesan dengan Admin</h3>
              </div>
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {pesans.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Belum ada pesan.</p>
                ) : (
                  pesans.map(p => {
                    const isMine = p.pengirim_id === user?.id;
                    return (
                      <div key={p.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-2 rounded-lg text-sm ${isMine ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                          <p>{p.isi}</p>
                          <p className={`text-xs mt-1 ${isMine ? 'text-green-200' : 'text-gray-400'}`}>
                            {formatDate(p.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <form onSubmit={handleKirimPesan} className="p-4 border-t flex gap-3">
                <input
                  type="text"
                  value={pesanText}
                  onChange={e => setPesanText(e.target.value)}
                  placeholder="Tulis pesan ke admin..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                <button
                  type="submit"
                  disabled={loadingAction || !pesanText.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  Kirim
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PenghuniDashboard;
