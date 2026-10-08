import { useState, useCallback, useRef } from 'react';
import api from '../services/authService';

const ImageUpload = ({ onSuccess, onRemove, existingUrl = null, maxSizeMB = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] }) => {
  const [preview, setPreview] = useState(existingUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = useCallback((file) => {
    const normalizedType = file.type === 'image/jpg' ? 'image/jpeg' : file.type;
    
    if (!allowedTypes.includes(file.type) && !allowedTypes.includes(normalizedType)) {
      setError('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.');
      return false;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File terlalu besar. Maksimal ${maxSizeMB}MB.`);
      return false;
    }
    setError(null);
    return true;
  }, [allowedTypes, maxSizeMB]);

  const handleFile = useCallback((file) => {
    if (!validateFile(file)) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setProgress(0);

    api.post('/upload/foto-kamar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      }
    })
      .then(({ data }) => {
        if (data.data?.url) {
          onSuccess(data.data.url);
        } else {
          throw new Error(data.error || 'Upload gagal');
        }
      })
      .catch((err) => {
        const msg = err.response?.data?.error || err.message || 'Upload gagal';
        setError(msg);
        if (existingUrl) {
          setPreview(existingUrl);
        } else {
          setPreview(null);
        }
      })
      .finally(() => {
        setUploading(false);
        setProgress(0);
      });
  }, [validateFile, existingUrl, onSuccess]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleRemove = useCallback(() => {
    if (preview && !existingUrl) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    onRemove();
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [preview, existingUrl, onRemove]);

  const openFileDialog = () => fileInputRef.current?.click();

  const isExistingImage = existingUrl && preview === existingUrl;

  return (
    <div className="border-2 border-dashed rounded-lg p-6 transition-colors"
         style={{ borderColor: isDragging ? '#3b82f6' : '#d1d5db' }}
         onDrop={handleDrop}
         onDragOver={handleDragOver}
         onDragLeave={handleDragLeave}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInput}
        className="hidden"
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm" role="alert">
          {error}
        </div>
      )}

      {preview ? (
        <div className="relative">
          <div className="aspect-square max-w-64 mx-auto rounded-lg overflow-hidden bg-gray-100">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm">Uploading... {progress}%</p>
                  <div className="w-48 h-2 bg-white bg-opacity-30 rounded-full mt-2 mx-auto overflow-hidden">
                    <div
                      className="h-full bg-blue-400 transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 justify-center mt-3">
            <button
              type="button"
              onClick={openFileDialog}
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
            >
              {existingUrl ? 'Ganti' : 'Pilih Lain'}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm disabled:opacity-50"
            >
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="mt-3 text-gray-600">Seret & lepas gambar di sini, atau klik untuk memilih</p>
          <p className="text-sm text-gray-400 mt-1">JPG, PNG, WebP • Maks 5MB</p>
          <button
            type="button"
            onClick={openFileDialog}
            disabled={uploading}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Pilih File
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;