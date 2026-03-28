import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils';
import { IconChart, IconPackage, IconUsers, IconClipboard, IconCheck, IconX } from '../components/Icons';

const STATUS_OPTIONS = ['ACTIVE', 'PENDING_CLAIM', 'RETURNED', 'EXPIRED', 'DELETED'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'dashboard') {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } else if (tab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data.users);
      } else if (tab === 'items') {
        const res = await api.get('/admin/items');
        setItems(res.data.items);
      } else if (tab === 'claims') {
        const res = await api.get('/admin/claims');
        setClaims(res.data.claims);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/ban`);
      showToast(res.data.message, 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'เกิดข้อผิดพลาด', 'error');
    }
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      await api.put(`/admin/items/${itemId}/status`, { status: newStatus });
      showToast(`อัปเดตสถานะเป็น ${newStatus} แล้ว`, 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'เกิดข้อผิดพลาด', 'error');
    }
  };

  const handleClaimAction = async (claimId, action) => {
    try {
      await api.put(`/claims/${claimId}/${action}`);
      showToast(action === 'accept' ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว', 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'เกิดข้อผิดพลาด', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const tabs = [
    { id: 'dashboard', label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconChart size={16} /> ภาพรวม</span> },
    { id: 'items', label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconPackage size={16} /> รายการ</span> },
    { id: 'users', label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconUsers size={16} /> ผู้ใช้</span> },
    { id: 'claims', label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconClipboard size={16} /> คำขอรับคืน</span> },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 64px' }} className="animate-fadeIn">
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Admin Dashboard</h1>
      <p style={{ color: 'var(--color-stone-light)', fontSize: 14, marginBottom: 24 }}>จัดการระบบ Lost & Found</p>

      
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid var(--color-sand)', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '10px 18px',
              background: 'none',
              border: 'none',
              borderBottom: tab === t.id ? '2px solid var(--color-terracotta)' : '2px solid transparent',
              color: tab === t.id ? 'var(--color-terracotta)' : 'var(--color-stone)',
              fontWeight: tab === t.id ? 600 : 400,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-stone-light)' }}>กำลังโหลด...</div>
      ) : (
        <>
          
          {tab === 'dashboard' && stats && (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 16,
                  marginBottom: 32,
                }}
                className="stagger"
              >
                <StatCard label="รายการทั้งหมด" value={stats.stats.totalItems} color="var(--color-ink)" />
                <StatCard label="ของหาย" value={stats.stats.lostItems} color="var(--color-terracotta)" />
                <StatCard label="เก็บได้" value={stats.stats.foundItems} color="var(--color-forest)" />
                <StatCard label="คืนสำเร็จ" value={stats.stats.returnedItems} color="var(--color-sky)" />
                <StatCard label="รอตรวจสอบ" value={stats.stats.pendingItems} color="var(--color-amber)" />
                <StatCard label="ผู้ใช้ทั้งหมด" value={stats.stats.totalUsers} color="var(--color-stone)" />
                <StatCard label="คำขอรับคืน" value={stats.stats.totalClaims} color="var(--color-terracotta-light)" />
                <StatCard label="คำขอรอดำเนินการ" value={stats.stats.pendingClaims} color="var(--color-amber)" />
              </div>

              
              {stats.byCategory.length > 0 && (
                <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-sand)', padding: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>ตามหมวดหมู่</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {stats.byCategory.map(cat => (
                      <div key={cat.category} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ width: 100, fontSize: 14, color: 'var(--color-stone)' }}>{cat.category}</span>
                        <div style={{ flex: 1, height: 8, background: 'var(--color-cream-dark)', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{
                            width: `${Math.min(100, (cat.count / stats.stats.totalItems) * 100)}%`,
                            height: '100%',
                            background: 'var(--color-terracotta)',
                            borderRadius: 999,
                            transition: 'width 0.6s ease-out',
                          }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', width: 30, textAlign: 'right' }}>{cat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          
          {tab === 'users' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-sand)', textAlign: 'left' }}>
                    <th style={thStyle}>ชื่อผู้ใช้</th>
                    <th style={thStyle}>อีเมล</th>
                    <th style={thStyle}>สิทธิ์</th>
                    <th style={thStyle}>โพสต์</th>
                    <th style={thStyle}>สถานะ</th>
                    <th style={thStyle}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.userId} style={{ borderBottom: '1px solid var(--color-cream-dark)' }}>
                      <td style={tdStyle}><strong>{u.username}</strong></td>
                      <td style={tdStyle}>{u.email}</td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                          background: u.role === 'admin' ? '#e3f2fd' : 'var(--color-cream-dark)',
                          color: u.role === 'admin' ? '#1565c0' : 'var(--color-stone)',
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={tdStyle}>{u.itemCount}</td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                          background: u.banned ? '#fbe9e7' : '#e8f5e9',
                          color: u.banned ? '#bf360c' : '#2e7d32',
                        }}>
                          {u.banned ? 'ถูกระงับ' : 'ปกติ'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleBan(u.userId)}
                            style={{
                              padding: '4px 12px', fontSize: 12, fontWeight: 500,
                              background: u.banned ? 'var(--color-forest)' : 'var(--color-danger)',
                              color: 'white', border: 'none', borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer', fontFamily: 'var(--font-body)',
                            }}
                          >
                            {u.banned ? 'ยกเลิกระงับ' : 'ระงับ'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          
          {tab === 'items' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-sand)', textAlign: 'left' }}>
                    <th style={thStyle}>รายการ</th>
                    <th style={thStyle}>ประเภท</th>
                    <th style={thStyle}>หมวดหมู่</th>
                    <th style={thStyle}>สถานที่</th>
                    <th style={thStyle}>โพสต์โดย</th>
                    <th style={thStyle}>สถานะ</th>
                    <th style={thStyle}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.itemId} style={{ borderBottom: '1px solid var(--color-cream-dark)' }}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {item.photoUrl && (
                            <img src={getImageUrl(item.photoUrl)} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                          )}
                          <span style={{ fontWeight: 500 }}>{item.title}</span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span className={`type-${item.type}`} style={{ padding: '2px 8px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                          {item.type === 'lost' ? 'หาย' : 'เก็บได้'}
                        </span>
                      </td>
                      <td style={tdStyle}>{item.category}</td>
                      <td style={tdStyle}>{item.location}</td>
                      <td style={tdStyle}>{item.postedBy}</td>
                      <td style={tdStyle}>
                        <span className={`status-${item.status.toLowerCase()}`} style={{ padding: '2px 8px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                          {item.status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.itemId, e.target.value)}
                          style={{
                            padding: '4px 8px', fontSize: 12, border: '1px solid var(--color-sand)',
                            borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-body)',
                          }}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          
          {tab === 'claims' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {claims.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-stone-light)' }}>ไม่มีคำขอรับคืน</div>
              ) : (
                claims.map(claim => (
                  <div
                    key={claim.claimId}
                    style={{
                      padding: 20, background: 'white', borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-sand)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                      <div>
                        <strong style={{ fontSize: 15 }}>{claim.itemTitle}</strong>
                        <span className={`status-${claim.status.toLowerCase()}`} style={{ padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, marginLeft: 8 }}>
                          {claim.status}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--color-stone-light)' }}>
                        {new Date(claim.createdAt).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-stone)', marginBottom: 6 }}>
                      ผู้ขอ: <strong>{claim.requesterName}</strong> → เจ้าของ: <strong>{claim.ownerName}</strong>
                    </div>
                    {claim.message && <p style={{ fontSize: 14, color: 'var(--color-stone)', marginBottom: 8 }}>{claim.message}</p>}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      {claim.evidencePhotoUrl && (
                        <img src={getImageUrl(claim.evidencePhotoUrl)} alt="evidence" style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                      )}
                      {claim.itemPhotoUrl && (
                        <img src={getImageUrl(claim.itemPhotoUrl)} alt="item" style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                      )}
                    </div>
                    {claim.status === 'WAITING' && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button onClick={() => handleClaimAction(claim.claimId, 'accept')}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 16px', background: 'var(--color-forest)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                          <IconCheck size={14} /> อนุมัติ
                        </button>
                        <button onClick={() => handleClaimAction(claim.claimId, 'reject')}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 16px', background: 'white', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                          <IconX size={14} /> ปฏิเสธ
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      padding: '20px 24px', background: 'white', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-sand)', borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--color-stone)', marginTop: 6 }}>{label}</div>
    </div>
  );
}

const thStyle = { padding: '10px 12px', fontWeight: 600, fontSize: 13, color: 'var(--color-stone-dark)' };
const tdStyle = { padding: '10px 12px' };
