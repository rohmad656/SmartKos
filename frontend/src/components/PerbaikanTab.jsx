import { useState } from 'react';
import { perbaikanService } from '../services/apiService';

const PerbaikanTab = ({ data, onRefresh }) => {
  const handleStatusUpdate = async (id, status) => {
    try {
      await perbaikanService.updateStatus(id, status);
      onRefresh();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'selesai') return 'bg-green-100 text-green-800';
    if (status === 'proses') return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
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
            {data.map(p => (
              <tr key={p.id}>
                <td className="px-6 py-4">{p.nama_penghuni}</td>
                <td className="px-6 py-4">{p.nomor_kamar}</td>
                <td className="px-6 py-4 text-sm">{p.deskripsi}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(p.status)}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={p.status}
                    onChange={(e) => handleStatusUpdate(p.id, e.target.value)}
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
  );
};

export default PerbaikanTab;
