import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { IconSearch, IconUpload } from '../components/Icons';

const CATEGORIES = ['กระเป๋า', 'อิเล็กทรอนิกส์', 'เอกสาร', 'กุญแจ', 'เสื้อผ้า', 'อื่นๆ'];

export default function PostItem() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    title: '', description: '', category: '', location: '', type: 'found',
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title || !form.category || !form.location) {
      return setError('กรุณากรอกข้อมูลที่จำเป็น');
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(k => formData.append(k, form[k]));
      if (photo) formData.append('photo', photo);

      const res = await api.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/items/${res.data.item.itemId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'โพสต์ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 24px 64px' }} className="animate-slideUp">
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>แจ้งประกาศ</h1>
      <p style={{ color: 'var(--color-stone-light)', fontSize: 15, marginBottom: 28 }}>
        ประกาศของหาย หรือแจ้งของที่เก็บได้
      </p>

      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', color: 'var(--color-danger)', fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--color-sand)' }}>
          {['found', 'lost'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setForm({ ...form, type: t })}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                background: form.type === t
                  ? (t === 'found' ? 'var(--color-forest)' : 'var(--color-terracotta)')
                  : 'white',
                color: form.type === t ? 'white' : 'var(--color-stone)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{t === 'found' ? 'เก็บได้' : 'ของหาย'}</span>
            </button>
          ))}
        </div>

        
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>รูปภาพ</label>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: '2px dashed var(--color-sand)',
              borderRadius: 'var(--radius-md)',
              padding: preview ? 0 : 32,
              textAlign: 'center',
              cursor: 'pointer',
              overflow: 'hidden',
              transition: 'border-color 0.15s',
              background: 'var(--color-cream-dark)',
              aspectRatio: preview ? '4/3' : 'auto',
            }}
          >
            {preview ? (
              <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <>
                <div style={{ marginBottom: 8, color: 'var(--color-stone-light)' }}><IconUpload size={36} /></div>
                <p style={{ color: 'var(--color-stone-light)', fontSize: 14 }}>คลิกเพื่ออัปโหลดรูปภาพ</p>
                <p style={{ color: 'var(--color-stone-light)', fontSize: 12, marginTop: 4 }}>JPG, PNG, WebP (สูงสุด 5MB)</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
        </div>

        
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>ชื่อรายการ *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            style={inputStyle}
            placeholder="เช่น กระเป๋าสตางค์สีน้ำตาล"
          />
        </div>

        
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>รายละเอียด</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="อธิบายลักษณะของ หรือรายละเอียดเพิ่มเติม"
          />
        </div>

        
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>หมวดหมู่ *</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
            style={inputStyle}
          >
            <option value="">เลือกหมวดหมู่</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>สถานที่ *</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
            style={inputStyle}
            placeholder="เช่น อาคาร 44 ชั้น 2 หรือ โรงอาหาร"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '12px',
            background: loading ? 'var(--color-stone-light)' : 'var(--color-terracotta)',
            color: 'white', border: 'none', borderRadius: 'var(--radius-sm)',
            fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-body)',
          }}
        >
          {loading ? 'กำลังโพสต์...' : 'โพสต์ประกาศ'}
        </button>
      </form>
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--color-stone-dark)',
};

const inputStyle = {
  width: '100%', padding: '10px 14px', border: '1px solid var(--color-sand)',
  borderRadius: 'var(--radius-sm)', fontSize: 15, fontFamily: 'var(--font-body)', background: 'white',
};
