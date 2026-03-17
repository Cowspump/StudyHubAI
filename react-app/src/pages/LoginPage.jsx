import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DB from '../utils/db';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regGroup, setRegGroup] = useState('');
  const [regError, setRegError] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const groups = DB.get('groups') || [];

  const handleLogin = (e) => {
    e.preventDefault();
    const user = login(loginEmail, loginPass);
    if (user) {
      navigate(user.role === 'teacher' ? '/teacher' : '/student');
    } else {
      setLoginError('Email немесе құпия сөз қате');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const res = register(regName, regEmail, regPass, regGroup);
    if (res?.error) {
      setRegError(res.error);
    } else {
      navigate('/student');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">EduPlatform</h1>
        <p className="auth-subtitle">Оқыту платформасы</p>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Кіру
          </button>
          <button
            className={`tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Тіркелу
          </button>
        </div>

        {activeTab === 'login' && (
          <form className="auth-form" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Құпия сөз"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">Кіру</button>
            {loginError && <p className="error-msg">{loginError}</p>}
            <p className="hint">Оқытушы: teacher@edu.kz / admin123</p>
          </form>
        )}

        {activeTab === 'register' && (
          <form className="auth-form" onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Аты-жөні"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Құпия сөз"
              value={regPass}
              onChange={(e) => setRegPass(e.target.value)}
              required
              minLength={6}
            />
            <select value={regGroup} onChange={(e) => setRegGroup(e.target.value)} required>
              <option value="">Топты таңдаңыз</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">Тіркелу</button>
            {regError && <p className="error-msg">{regError}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
