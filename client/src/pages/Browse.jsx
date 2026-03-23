import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import ItemCard from '../components/ItemCard';
import { IconSearch } from '../components/Icons';

const CATEGORIES = ['ทั้งหมด', 'กระเป๋า', 'อิเล็กทรอนิกส์', 'เอกสาร', 'กุญแจ', 'เสื้อผ้า', 'อื่นๆ'];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchItems();
  }, [category, type, page]);

  const fetchItems = async (searchTerm) => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (category && category !== 'ทั้งหมด') params.category = category;
      if (type) params.type = type;
      if (searchTerm !== undefined ? searchTerm : search) params.search = searchTerm !== undefined ? searchTerm : search;

      const res = await api.get('/items', { params });
      setItems(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchItems(search);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 64px' }} className="animate-fadeIn">
      
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>ค้นหาของ</h1>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, maxWidth: 500 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาจากชื่อหรือรายละเอียด..."
            style={{
              flex: 1, padding: '10px 14px', border: '1px solid var(--color-sand)',
              borderRadius: 'var(--radius-sm)', fontSize: 15, fontFamily: 'var(--font-body)',
              background: 'white',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 20px', background: 'var(--color-terracotta)', color: 'white',
              border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconSearch size={16} /> ค้นหา</span>
          </button>
        </form>
      </div>

      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24, alignItems: 'center' }}>
        
        <div style={{ display: 'flex', gap: 0, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--color-sand)' }}>
          {[
            { value: '', label: 'ทั้งหมด' },
            { value: 'lost', label: 'ของหาย' },
            { value: 'found', label: 'เก็บได้' },
          ].map((t, idx) => (
            <button
              key={t.value || idx}
              onClick={() => { setType(t.value); setPage(1); }}
              style={{
                padding: '8px 16px', border: 'none',
                background: type === t.value ? 'var(--color-ink)' : 'white',
                color: type === t.value ? 'white' : 'var(--color-stone)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => { setCategory(c === 'ทั้งหมด' ? '' : c); setPage(1); }}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                border: '1px solid',
                borderColor: (category === c || (c === 'ทั้งหมด' && !category)) ? 'var(--color-terracotta)' : 'var(--color-sand)',
                background: (category === c || (c === 'ทั้งหมด' && !category)) ? 'var(--color-terracotta)' : 'white',
                color: (category === c || (c === 'ทั้งหมด' && !category)) ? 'white' : 'var(--color-stone)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)',
                transition: 'all 0.15s',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <span style={{ fontSize: 13, color: 'var(--color-stone-light)', marginLeft: 'auto' }}>
          {total} รายการ
        </span>
      </div>

      
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-stone-light)' }}>กำลังโหลด...</div>
      ) : items.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
          }}
          className="stagger"
        >
          {items.map(item => (
            <ItemCard key={item.itemId} item={item} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginBottom: 16 }}><IconSearch size={48} style={{ color: 'var(--color-stone-light)' }} /></div>
          <p style={{ color: 'var(--color-stone-light)', fontSize: 16 }}>ไม่พบรายการที่ค้นหา</p>
          <p style={{ color: 'var(--color-stone-light)', fontSize: 14, marginTop: 4 }}>ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
        </div>
      )}
    </div>
  );
}
