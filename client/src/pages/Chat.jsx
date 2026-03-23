import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { IconChat } from '../components/Icons';

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(searchParams.get('room') || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchRooms();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom);
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => fetchMessages(activeRoom), 3000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/chat/rooms');
      setRooms(res.data.rooms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const res = await api.get(`/chat/rooms/${chatId}/messages`);
      setMessages(res.data.messages);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom) return;
    try {
      await api.post(`/chat/rooms/${activeRoom}/messages`, { content: newMessage });
      setNewMessage('');
      fetchMessages(activeRoom);
    } catch (err) {
      console.error(err);
    }
  };

  const activeRoomData = rooms.find(r => r.chatId === activeRoom);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      
      <div
        style={{
          width: 320,
          borderRight: '1px solid var(--color-sand)',
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
        className="hidden md:flex"
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-cream-dark)', fontWeight: 600, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconChat size={20} /> แชท
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-stone-light)', fontSize: 14 }}>กำลังโหลด...</div>
          ) : rooms.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-stone-light)', fontSize: 14 }}>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><IconChat size={48} style={{ opacity: 0.5 }} /></div>
              ยังไม่มีห้องแชท
            </div>
          ) : (
            rooms.map(room => (
              <div
                key={room.chatId}
                onClick={() => setActiveRoom(room.chatId)}
                style={{
                  padding: '14px 20px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--color-cream-dark)',
                  background: activeRoom === room.chatId ? 'var(--color-cream-dark)' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {room.itemTitle}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-stone-light)', marginBottom: 2 }}>
                  กับ {room.otherUser}
                </div>
                {room.lastMessage && (
                  <div style={{ fontSize: 12, color: 'var(--color-stone-light)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {room.lastMessage}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--color-cream)' }}>
        {activeRoom ? (
          <>
            
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-sand)', background: 'white', display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setActiveRoom(null)}
                className="md:hidden"
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: '4px 8px' }}
              >
                ←
              </button>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{activeRoomData?.itemTitle || 'แชท'}</div>
                <div style={{ fontSize: 12, color: 'var(--color-stone-light)' }}>กับ {activeRoomData?.otherUser}</div>
              </div>
            </div>

            
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>
              {messages.map(msg => {
                const isMine = msg.senderId === user.userId;
                return (
                  <div
                    key={msg.messageId}
                    style={{
                      display: 'flex',
                      justifyContent: isMine ? 'flex-end' : 'flex-start',
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '70%',
                        padding: '10px 14px',
                        borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        background: isMine ? 'var(--color-terracotta)' : 'white',
                        color: isMine ? 'white' : 'var(--color-ink)',
                        fontSize: 14,
                        lineHeight: 1.5,
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      {!isMine && (
                        <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 2, color: 'var(--color-terracotta)' }}>
                          {msg.senderName}
                        </div>
                      )}
                      {msg.content}
                      <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7, textAlign: 'right' }}>
                        {new Date(msg.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            
            <form
              onSubmit={sendMessage}
              style={{
                padding: '12px 20px',
                borderTop: '1px solid var(--color-sand)',
                background: 'white',
                display: 'flex',
                gap: 10,
              }}
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="พิมพ์ข้อความ..."
                style={{
                  flex: 1, padding: '10px 14px', border: '1px solid var(--color-sand)',
                  borderRadius: 999, fontSize: 14, fontFamily: 'var(--font-body)', background: 'var(--color-cream)',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '10px 20px', background: 'var(--color-terracotta)', color: 'white',
                  border: 'none', borderRadius: 999, fontWeight: 600, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                ส่ง
              </button>
            </form>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-stone-light)', flexDirection: 'column' }}>
            
            <div className="md:hidden" style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
              <div style={{ padding: '16px 20px', fontWeight: 600, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}><IconChat size={20} /> แชท</div>
              {rooms.map(room => (
                <div
                  key={room.chatId}
                  onClick={() => setActiveRoom(room.chatId)}
                  style={{ padding: '14px 20px', cursor: 'pointer', borderBottom: '1px solid var(--color-cream-dark)' }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{room.itemTitle}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-stone-light)' }}>กับ {room.otherUser}</div>
                </div>
              ))}
              {rooms.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><IconChat size={48} style={{ opacity: 0.5 }} /></div>
                  <p>ยังไม่มีห้องแชท</p>
                  <p style={{ fontSize: 13, marginTop: 4 }}>เริ่มแชทจากหน้ารายละเอียดรายการ</p>
                </div>
              )}
            </div>
            <div className="hidden md:flex" style={{ flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ marginBottom: 16 }}><IconChat size={64} style={{ opacity: 0.5 }} /></div>
              <p>เลือกห้องแชทจากด้านซ้าย</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
