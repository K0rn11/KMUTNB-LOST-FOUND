import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils';
import { IconPackage, IconPin, IconFolder, IconUser, IconCalendar, IconHand, IconChat, IconCheck, IconX } from '../components/Icons';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [item, setItem] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimForm, setClaimForm] = useState({ message: '', evidence: null, preview: null });
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const res = await api.get(`/items/${id}`);
      setItem(res.data.item);
      if (user) {
        const claimsRes = await api.get(`/claims/item/${id}`);
        setClaims(claimsRes.data.claims);
      }
    } catch (err) {
      navigate('/browse');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('itemId', id);
      formData.append('message', claimForm.message);
      if (claimForm.evidence) formData.append('evidence', claimForm.evidence);

      await api.post('/claims', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowClaimForm(false);
      showToast('ส่งคำขอรับคืนเรียบร้อย', 'success');
      fetchItem();
    } catch (err) {
      showToast(err.response?.data?.error || 'เกิดข้อผิดพลาด', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaimAction = async (claimId, action) => {
    try {
      await api.put(`/claims/${claimId}/${action}`);
      showToast(action === 'accept' ? 'อนุมัติคำขอเรียบร้อย' : 'ปฏิเสธคำขอเรียบร้อย', 'success');
      fetchItem();
    } catch (err) {
      showToast(err.response?.data?.error || 'เกิดข้อผิดพลาด', 'error');
    }
  };

  const handleChat = async () => {
    if (!user || !item) return;
    try {
      const res = await api.post('/chat/rooms', { itemId: item.itemId, otherUserId: item.userId });
      navigate(`/chat?room=${res.data.room.chatId}`);
    } catch (err) {
      showToast('ไม่สามารถเปิดแชทได้', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80, color: 'var(--color-stone-light)' }}>กำลังโหลด...</div>;
  }

  if (!item) return null;

  const isOwner = user?.userId === item.userId;
  const canClaim = user && !isOwner && item.status === 'ACTIVE';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 64px' }} className="animate-fadeIn">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
        
        <div>
          <div
            style={{
              aspectRatio: '4/3', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              background: 'var(--color-cream-dark)', border: '1px solid var(--color-sand)',
            }}
          >
            {item.photoUrl ? (
              <img src={getImageUrl(item.photoUrl)} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><IconPackage size={64} style={{ opacity: 0.4 }} /></div>
            )}
          </div>
        </div>

        
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span className={`type-${item.type}`} style={{ padding: '4px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600 }}>
              {item.type === 'lost' ? 'ของหาย' : 'เก็บได้'}
            </span>
            <span className={`status-${item.status?.toLowerCase()}`} style={{ padding: '4px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600 }}>
              {statusLabel(item.status)}
            </span>
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>{item.title}</h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, fontSize: 14, color: 'var(--color-stone)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IconPin size={16} /> สถานที่: <strong>{item.location}</strong></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IconFolder size={16} /> หมวดหมู่: <strong>{item.category}</strong></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IconUser size={16} /> โพสต์โดย: <strong>{item.postedBy}</strong></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IconCalendar size={16} /> {new Date(item.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          {item.description && (
            <div style={{ padding: 16, background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-sand)', marginBottom: 20, fontSize: 14, lineHeight: 1.6 }}>
              {item.description}
            </div>
          )}

          
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {canClaim && (
              <button
                onClick={() => setShowClaimForm(!showClaimForm)}
                style={{
                  padding: '10px 24px', background: 'var(--color-terracotta)', color: 'white',
                  border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}><IconHand size={16} /> ขอรับของคืน</span>
              </button>
            )}
            {user && !isOwner && (
              <button
                onClick={handleChat}
                style={{
                  padding: '10px 24px', background: 'white', color: 'var(--color-ink)',
                  border: '1px solid var(--color-sand)', borderRadius: 'var(--radius-sm)',
                  fontWeight: 500, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}><IconChat size={16} /> แชทกับผู้โพสต์</span>
              </button>
            )}
          </div>
        </div>
      </div>

      
      {showClaimForm && (
        <div style={{ marginTop: 32, padding: 24, background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-sand)' }} className="animate-slideUp">
          <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 16 }}>ส่งคำขอรับของคืน</h3>
          <form onSubmit={handleClaim}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--color-stone-dark)' }}>
                ข้อความอธิบายว่าเป็นของคุณอย่างไร
              </label>
              <textarea
                value={claimForm.message}
                onChange={(e) => setClaimForm({ ...claimForm, message: e.target.value })}
                rows={3}
                style={{
                  width: '100%', padding: '10px 14px', border: '1px solid var(--color-sand)',
                  borderRadius: 'var(--radius-sm)', fontSize: 14, fontFamily: 'var(--font-body)', resize: 'vertical',
                }}
                placeholder="อธิบายลักษณะเฉพาะ เช่น สี ยี่ห้อ หรือเอกสารที่สามารถพิสูจน์ได้"
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--color-stone-dark)' }}>
                หลักฐานยืนยัน (รูปภาพ)
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setClaimForm({ ...claimForm, evidence: file, preview: URL.createObjectURL(file) });
                }}
                style={{ fontSize: 14 }}
              />
              {claimForm.preview && (
                <img src={claimForm.preview} alt="evidence" style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginTop: 8 }} />
              )}
            </div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 24px', background: submitting ? 'var(--color-stone-light)' : 'var(--color-terracotta)',
                color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600,
                fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)',
              }}
            >
              {submitting ? 'กำลังส่ง...' : 'ส่งคำขอ'}
            </button>
          </form>
        </div>
      )}

      
      {isOwner && claims.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 16 }}>คำขอรับของคืน ({claims.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {claims.map(claim => (
              <div
                key={claim.claimId}
                style={{
                  padding: 20, background: 'white', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-sand)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <strong>{claim.requesterName}</strong>
                    <span className={`status-${claim.status.toLowerCase()}`} style={{ padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, marginLeft: 8 }}>
                      {claim.status === 'WAITING' ? 'รอตรวจสอบ' : claim.status === 'ACCEPTED' ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว'}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--color-stone-light)' }}>
                    {new Date(claim.createdAt).toLocaleDateString('th-TH')}
                  </span>
                </div>
                {claim.message && <p style={{ fontSize: 14, color: 'var(--color-stone)', marginBottom: 10 }}>{claim.message}</p>}
                {claim.evidencePhotoUrl && (
                  <img src={getImageUrl(claim.evidencePhotoUrl)} alt="evidence" style={{ width: 150, height: 100, objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: 10 }} />
                )}
                {claim.status === 'WAITING' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleClaimAction(claim.claimId, 'accept')}
                      style={{
                        padding: '6px 16px', background: 'var(--color-forest)', color: 'white',
                        border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'var(--font-body)',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}><IconCheck size={14} /> อนุมัติ</span>
                    </button>
                    <button
                      onClick={() => handleClaimAction(claim.claimId, 'reject')}
                      style={{
                        padding: '6px 16px', background: 'white', color: 'var(--color-danger)',
                        border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-sm)',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}><IconX size={14} /> ปฏิเสธ</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}

function statusLabel(status) {
  const labels = { ACTIVE: 'ประกาศอยู่', PENDING_CLAIM: 'รอตรวจสอบ', RETURNED: 'คืนแล้ว', EXPIRED: 'หมดอายุ', DELETED: 'ถูกลบ' };
  return labels[status] || status;
}
