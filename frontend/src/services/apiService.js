import api from '../services/authService';

export const uploadService = {
  async uploadFotoKamar(file) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/upload/foto-kamar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data.data;
  }
};

export const kamarService = {
  async getAll(status = null) {
    const params = status ? { params: { status } } : {};
    const { data } = await api.get('/kamar', params);
    return data.data;
  },

  async getById(id) {
    const { data } = await api.get(`/kamar/${id}`);
    return data.data;
  },

  async create(kamarData) {
    const { data } = await api.post('/kamar', kamarData);
    return data.data;
  },

  async update(id, kamarData) {
    const { data } = await api.put(`/kamar/${id}`, kamarData);
    return data.data;
  },

  async delete(id) {
    const { data } = await api.delete(`/kamar/${id}`);
    return data.data;
  }
};

export const penghuniService = {
  async getAll(kamarId = null) {
    const params = kamarId ? { params: { kamar_id: kamarId } } : {};
    const { data } = await api.get('/penghuni', params);
    return data.data;
  },

  async create(penghuniData) {
    const { data } = await api.post('/penghuni', penghuniData);
    return data.data;
  },

  async update(id, penghuniData) {
    const { data } = await api.put(`/penghuni/${id}`, penghuniData);
    return data.data;
  },

  async delete(id) {
    const { data } = await api.delete(`/penghuni/${id}`);
    return data.data;
  }
};

export const pembayaranService = {
  async getAll(penghuniId = null) {
    const params = penghuniId ? { params: { penghuni_id: penghuniId } } : {};
    const { data } = await api.get('/pembayaran', params);
    return data.data;
  },

  async create(pembayaranData) {
    const { data } = await api.post('/pembayaran', pembayaranData);
    return data.data;
  },

  async update(id, pembayaranData) {
    const { data } = await api.put(`/pembayaran/${id}`, pembayaranData);
    return data.data;
  },

  async bayar(id) {
    const { data } = await api.post(`/pembayaran/${id}/bayar`);
    return data.data;
  }
};

export const perbaikanService = {
  async getAll() {
    const { data } = await api.get('/perbaikan');
    return data.data;
  },

  async create(perbaikanData) {
    const { data } = await api.post('/perbaikan', perbaikanData);
    return data.data;
  },

  async updateStatus(id, status) {
    const { data } = await api.put(`/perbaikan/${id}`, { status });
    return data.data;
  }
};

export const pengumumanService = {
  async getAll() {
    const { data } = await api.get('/pengumuman');
    return data.data;
  },

  async create(pengumumanData) {
    const { data } = await api.post('/pengumuman', pengumumanData);
    return data.data;
  },

  async delete(id) {
    const { data } = await api.delete(`/pengumuman/${id}`);
    return data.data;
  }
};

export const bookingService = {
  async getAll() {
    const { data } = await api.get('/booking');
    return data.data;
  },

  async updateStatus(id, status) {
    const { data } = await api.put(`/booking/${id}`, { status });
    return data.data;
  },

  async setSurvei(id, tanggalSurvei) {
    const { data } = await api.put(`/booking/${id}/survei`, { tanggalSurvei });
    return data.data;
  }
};

export const pesanService = {
  async getConversation() {
    const { data } = await api.get('/pesan');
    return data.data;
  },

  async send(penerimaId, isi) {
    const { data } = await api.post('/pesan', { penerimaId, isi });
    return data.data;
  },

  async markRead(id) {
    const { data } = await api.put(`/pesan/${id}/read`);
    return data.data;
  }
};
