import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';
import DB from '../utils/db';

function getUnreadCount(userId) {
  const msgs = DB.get('messages') || [];
  return msgs.filter((m) => m.toId === userId && !m.read).length;
}

export default function Sidebar({ links }) {
  const { user, logout } = useAuth();
  const unread = getUnreadCount(user.id);
  const groups = DB.get('groups') || [];
  const group = groups.find((g) => g.id === user.groupId);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        {user.photo ? (
          <img
            src={user.photo}
            className="avatar"
            alt="Фото"
            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '50%' }}
          />
        ) : (
          <div className="avatar-initials">{getInitials(user.name)}</div>
        )}
        <h3>{user.name}</h3>
        <p className={`role-badge ${user.role === 'student' ? 'student-badge' : ''}`}>
          {user.role === 'teacher' ? 'Оқытушы' : group?.name || 'Студент'}
        </p>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {link.label}
            {link.showUnread && unread > 0 && (
              <span
                style={{
                  background: 'var(--danger)',
                  color: '#fff',
                  borderRadius: '50%',
                  padding: '1px 6px',
                  fontSize: '0.7rem',
                  marginLeft: 4,
                }}
              >
                {unread}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <button className="btn btn-logout" onClick={logout}>
        Шығу
      </button>
    </aside>
  );
}
