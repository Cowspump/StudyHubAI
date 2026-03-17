import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import DB from '../../utils/db';
import { formatTime } from '../../utils/helpers';

export default function StudentMessages() {
  const { user } = useAuth();
  const { t } = useLang();
  const [msgText, setMsgText] = useState('');
  const [, forceUpdate] = useState(0);
  const chatRef = useRef(null);

  const users = DB.get('users') || [];
  const teacher = users.find((u) => u.role === 'teacher');

  const allMsgs = DB.get('messages') || [];
  const chatMsgs = teacher
    ? allMsgs
        .filter(
          (m) =>
            (m.fromId === user.id && m.toId === teacher.id) ||
            (m.fromId === teacher.id && m.toId === user.id)
        )
        .sort((a, b) => a.date - b.date)
    : [];

  // Mark read
  useEffect(() => {
    if (!teacher) return;
    const messages = DB.get('messages') || [];
    let changed = false;
    messages.forEach((m) => {
      if (m.fromId === teacher.id && m.toId === user.id && !m.read) {
        m.read = true;
        changed = true;
      }
    });
    if (changed) DB.set('messages', messages);
  }, [teacher, user.id]);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [chatMsgs.length]);

  if (!teacher) return <p>{t('teacherNotFound')}</p>;

  const handleSend = (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    const messages = DB.get('messages') || [];
    messages.push({
      id: 'msg' + DB.generateId(),
      fromId: user.id,
      toId: teacher.id,
      text: msgText.trim(),
      date: Date.now(),
      read: false,
    });
    DB.set('messages', messages);
    setMsgText('');
    forceUpdate((n) => n + 1);
  };

  return (
    <div className="messages-section">
      <h2>{t('messages')}</h2>
      <div className="msg-chat-box" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', height: 520, boxShadow: 'var(--shadow)', background: 'var(--surface)' }}>
        <div className="msg-chat-header">
          <img
            src={teacher.photo || '/src/assets/placeholder.svg'}
            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
            alt=""
          />
          <div>
            <strong>{teacher.name}</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{t('teacherLabel')}</p>
          </div>
        </div>

        <div className="msg-chat-messages" ref={chatRef}>
          {chatMsgs.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
              {t('noMessagesStudent')}
            </p>
          )}
          {chatMsgs.map((m) => (
            <div key={m.id} className={`msg-bubble ${m.fromId === user.id ? 'msg-out' : 'msg-in'}`}>
              <div className="msg-text">{m.text}</div>
              <div className="msg-time">{formatTime(m.date)}</div>
            </div>
          ))}
        </div>

        <form className="msg-chat-input" onSubmit={handleSend}>
          <input
            type="text"
            placeholder={t('writeMessage')}
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            autoComplete="off"
            required
          />
          <button type="submit" className="btn btn-primary">{t('send')}</button>
        </form>
      </div>
    </div>
  );
}
