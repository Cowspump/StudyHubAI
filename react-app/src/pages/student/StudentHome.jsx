import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import DB from '../../utils/db';

export default function StudentHome() {
  const { user } = useAuth();
  const { t } = useLang();
  const groups = DB.get('groups') || [];
  const group = groups.find((g) => g.id === user.groupId);
  const results = (DB.get('results') || []).filter((r) => r.userId === user.id);
  const tests = (DB.get('tests') || []).filter((t) => t.groupIds.includes(user.groupId));
  const avgScore =
    results.length > 0
      ? Math.round(results.reduce((s, r) => s + (r.score / r.total) * 100, 0) / results.length)
      : 0;

  const users = DB.get('users') || [];
  const teacher = users.find((u) => u.role === 'teacher');

  return (
    <>
      <h2>{t('welcome')}, {user.name.split(' ')[0]}!</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-num">{group?.name || '—'}</span>
          <span className="stat-label">{t('group')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{tests.length}</span>
          <span className="stat-label">{t('availableTests')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{results.length}</span>
          <span className="stat-label">{t('submitted')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{avgScore}%</span>
          <span className="stat-label">{t('average')}</span>
        </div>
      </div>

      <div className="card">
        <h3>{t('teacherInfo')}</h3>
        {teacher ? (
          <div className="profile-info">
            <img
              src={teacher.photo || '/src/assets/placeholder.svg'}
              className="avatar-lg"
              alt={t('photo')}
              style={{ width: 120, height: 150, objectFit: 'cover', borderRadius: 12 }}
            />
            <div>
              <p><strong>{teacher.name}</strong></p>
              <p>{teacher.position || ''}</p>
              <p>{teacher.bio || ''}</p>
              <p>{t('email')}: <a href={`mailto:${teacher.email}`}>{teacher.email}</a></p>
              <p>{t('phone')}: {teacher.phone || '—'}</p>
              <p>{t('telegram')}: {teacher.telegram || '—'}</p>
            </div>
          </div>
        ) : (
          <p>{t('infoUnavailable')}</p>
        )}
      </div>
    </>
  );
}
