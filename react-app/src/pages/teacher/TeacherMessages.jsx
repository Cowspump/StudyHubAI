import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import DB from '../../utils/db';
import { getInitials, formatTime, escapeHtml } from '../../utils/helpers';

export default function TeacherMessages() {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState(null);
  const [msgText, setMsgText] = useState('');
  const [, forceUpdate] = useState(0);
  const chatRef = useRef(null);

  const users = DB.get('users') || [];
  const students = users.filter((u) => u.role === 'student');
  const allMsgs = DB.get('messages') || [];
  const groups = DB.get('groups') || [];

  const convos = students
    .map((s) => {
      const msgs = allMsgs.filter(
        (m) => (m.fromId === s.id && m.toId === user.id) || (m.fromId === user.id && m.toId === s.id)
      );
      const last = [...msgs].sort((a, b) => b.date - a.date)[0];
      const unread = msgs.filter((m) => m.fromId === s.id && !m.read).length;
      const group = groups.find((g) => g.id === s.groupId);
      return { student: s, last, unread, group };
    })
    .filter((c) => c.last || c.unread > 0)
    .sort((a, b) => {
      if (!a.last) return 1;
      if (!b.last) return -1;
      return b.last.date - a.last.date;
    });

  const selectedStudent = selectedId ? students.find((s) => s.id === selectedId) : null;

  const chatMsgs = selectedStudent
    ? allMsgs
        .filter(
          (m) =>
            (m.fromId === selectedStudent.id && m.toId === user.id) ||
            (m.fromId === user.id && m.toId === selectedStudent.id)
        )
        .sort((a, b) => a.date - b.date)
    : [];

  // Mark read
  useEffect(() => {
    if (!selectedStudent) return;
    const messages = DB.get('messages') || [];
    let changed = false;
    messages.forEach((m) => {
      if (m.fromId === selectedStudent.id && m.toId === user.id && !m.read) {
        m.read = true;
        changed = true;
      }
    });
    if (changed) DB.set('messages', messages);
  }, [selectedStudent, user.id]);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [chatMsgs.length]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!msgText.trim() || !selectedId) return;
    const messages = DB.get('messages') || [];
    messages.push({
      id: 'msg' + DB.generateId(),
      fromId: user.id,
      toId: selectedId,
      text: msgText.trim(),
      date: Date.now(),
      read: false,
    });
    DB.set('messages', messages);
    setMsgText('');
    forceUpdate((n) => n + 1);
  };

  const sg = selectedStudent ? groups.find((g) => g.id === selectedStudent.groupId) : null;

  return (
    <div className="messages-section">
      <h2>Хабарламалар</h2>
      <div className="msg-layout">
        <div className="msg-sidebar">
          {convos.length === 0 && (
            <p style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>
              Хабарламалар жоқ
            </p>
          )}
          {convos.map((c) => (
            <div
              key={c.student.id}
              className={`msg-convo ${c.student.id === selectedId ? 'msg-convo-active' : ''}`}
              onClick={() => setSelectedId(c.student.id)}
            >
              <div className="avatar-initials" style={{ width: 40, height: 40, fontSize: '0.85rem', flexShrink: 0 }}>
                {getInitials(c.student.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.9rem' }}>{c.student.name}</strong>
                  {c.unread > 0 && <span className="msg-unread-badge">{c.unread}</span>}
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.last?.text?.slice(0, 40) || ''}
                </p>
              </div>
            </div>
          ))}

          {/* All students without conversations */}
          {students.filter((s) => !convos.find((c) => c.student.id === s.id)).length > 0 && (
            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Барлық студенттер:</p>
              {students
                .filter((s) => !convos.find((c) => c.student.id === s.id))
                .map((s) => (
                  <div
                    key={s.id}
                    className={`msg-convo ${s.id === selectedId ? 'msg-convo-active' : ''}`}
                    onClick={() => setSelectedId(s.id)}
                  >
                    <div className="avatar-initials" style={{ width: 32, height: 32, fontSize: '0.75rem', flexShrink: 0 }}>
                      {getInitials(s.name)}
                    </div>
                    <span style={{ fontSize: '0.85rem' }}>{s.name}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="msg-chat-box">
          {selectedStudent ? (
            <>
              <div className="msg-chat-header">
                <div className="avatar-initials" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>
                  {getInitials(selectedStudent.name)}
                </div>
                <div>
                  <strong>{selectedStudent.name}</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{sg?.name || ''}</p>
                </div>
              </div>
              <div className="msg-chat-messages" ref={chatRef}>
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
                  placeholder="Жауап жазыңыз..."
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  autoComplete="off"
                  required
                />
                <button type="submit" className="btn btn-primary">Жіберу</button>
              </form>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              Студентті таңдаңыз
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
