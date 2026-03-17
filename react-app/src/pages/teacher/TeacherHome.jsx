import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import DB from '../../utils/db';
import { getApiKey, setApiKey } from '../../utils/openai';

export default function TeacherHome() {
  const { user, updateUser } = useAuth();
  const { t } = useLang();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...user });
  const [apiKey, setApiKeyState] = useState(getApiKey());
  const [apiStatus, setApiStatus] = useState(getApiKey() ? t('apiKeySet') : t('apiKeyNotSet'));

  const groups = DB.get('groups') || [];
  const users = DB.get('users') || [];
  const students = users.filter((u) => u.role === 'student');
  const tests = DB.get('tests') || [];
  const results = DB.get('results') || [];

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUser(form);
    setEditing(false);
  };

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    setApiKey(apiKey);
    if (apiKey) {
      alert(t('apiKeySaved'));
      setApiStatus(t('apiKeySet'));
    } else {
      alert(t('apiKeyRemoved'));
      setApiStatus(t('apiKeyNotSet'));
    }
  };

  // Rating
  const rating = students
    .map((s) => {
      const sr = results.filter((r) => r.userId === s.id);
      const total = sr.length;
      const avg = total > 0 ? Math.round(sr.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) / total) : 0;
      const group = groups.find((g) => g.id === s.groupId);
      return { ...s, groupName: group?.name || t('noInfo'), testCount: total, avg };
    })
    .sort((a, b) => b.avg - a.avg || b.testCount - a.testCount);

  const medal = (i) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`);

  const statusBadge = (avg, total) => {
    if (total === 0) return <span style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>{t('noTestsTaken')}</span>;
    if (avg >= 80) return <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>{t('levelGreat')}</span>;
    if (avg >= 60) return <span style={{ background: '#fef9c3', color: '#854d0e', padding: '2px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>{t('levelGood')}</span>;
    return <span style={{ background: '#fef2f2', color: '#991b1b', padding: '2px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>{t('levelNeedHelp')}</span>;
  };

  return (
    <>
      <h2>{t('teacherPanel')}</h2>

      <div className="stats-grid">
        <div className="stat-card"><span className="stat-num">{groups.length}</span><span className="stat-label">{t('groups')}</span></div>
        <div className="stat-card"><span className="stat-num">{students.length}</span><span className="stat-label">{t('students')}</span></div>
        <div className="stat-card"><span className="stat-num">{tests.length}</span><span className="stat-label">{t('tests')}</span></div>
        <div className="stat-card"><span className="stat-num">{results.length}</span><span className="stat-label">{t('results')}</span></div>
      </div>

      {/* Profile */}
      <div className="card profile-card">
        <div className="card-header">
          <h3>{t('teacherProfile')}</h3>
          {!editing && (
            <button className="btn btn-sm" onClick={() => setEditing(true)} style={{ background: '#8b5cf6', color: '#fff' }}>
              {t('edit')}
            </button>
          )}
        </div>

        {!editing ? (
          <div className="profile-info">
            <img
              src={user.photo || '/src/assets/placeholder.svg'}
              className="avatar-lg"
              alt={t('photo')}
              style={{ width: 120, height: 150, objectFit: 'cover', borderRadius: 12 }}
            />
            <div>
              <p><strong>{t('name')}:</strong> {user.name}</p>
              <p><strong>{t('position')}:</strong> {user.position || t('noInfo')}</p>
              <p><strong>{t('email')}:</strong> {user.email}</p>
              <p><strong>{t('phone')}:</strong> {user.phone || t('noInfo')}</p>
              <p><strong>{t('telegram')}:</strong> {user.telegram || t('noInfo')}</p>
              <p><strong>{t('aboutMe')}:</strong> {user.bio || t('noInfo')}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="profile-info" style={{ alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <img
                    src={form.photo || '/src/assets/placeholder.svg'}
                    className="avatar-lg"
                    alt={t('photo')}
                    style={{ width: 120, height: 150, objectFit: 'cover', borderRadius: 12 }}
                  />
                  <input
                    type="text"
                    placeholder={t('photoUrl')}
                    value={form.photo || ''}
                    onChange={(e) => setForm({ ...form, photo: e.target.value })}
                    style={{ width: 120, fontSize: '0.75rem' }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('name')}</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('position')}</label>
                  <input value={form.position || ''} onChange={(e) => setForm({ ...form, position: e.target.value })} />
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('email')}</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('phone')}</label>
                  <input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('telegram')}</label>
                  <input value={form.telegram || ''} onChange={(e) => setForm({ ...form, telegram: e.target.value })} />
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('aboutMe')}</label>
                  <textarea rows={3} value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" style={{ background: '#8b5cf6' }}>{t('save')}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>{t('cancel')}</button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* API Key */}
      <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
        <h3>{t('openaiSettings')}</h3>
        <p style={{ color: '#666', marginBottom: 12 }}>{t('openaiSettingsDesc')}</p>
        <form className="inline-form" onSubmit={handleSaveApiKey} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKeyState(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" style={{ background: '#8b5cf6' }}>{t('save')}</button>
        </form>
        <p style={{ marginTop: 8, fontSize: '0.85rem', color: '#666' }}>{apiStatus}</p>
      </div>

      {/* Rating */}
      {students.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>{t('studentRating')}</h3></div>
          <div style={{ overflowX: 'auto' }}>
            <table className="results-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>{t('student')}</th>
                  <th>{t('group')}</th>
                  <th style={{ width: 80 }}>{t('tests')}</th>
                  <th style={{ width: 200 }}>{t('average')}</th>
                  <th>{t('level')}</th>
                </tr>
              </thead>
              <tbody>
                {rating.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ textAlign: 'center', fontSize: '1.1rem' }}>{medal(i)}</td>
                    <td><strong>{s.name}</strong></td>
                    <td>{s.groupName}</td>
                    <td style={{ textAlign: 'center' }}>{s.testCount}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: '100%', background: '#f1f5f9', borderRadius: 100, height: 8 }}>
                          <div style={{
                            width: `${s.avg}%`, height: '100%', borderRadius: 100,
                            background: s.avg >= 80 ? 'var(--success)' : s.avg >= 60 ? '#f59e0b' : 'var(--danger)',
                          }} />
                        </div>
                        <span style={{ fontWeight: 700, minWidth: 36 }}>{s.avg}%</span>
                      </div>
                    </td>
                    <td>{statusBadge(s.avg, s.testCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
