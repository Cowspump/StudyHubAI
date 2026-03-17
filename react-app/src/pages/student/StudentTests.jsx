import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DB from '../../utils/db';

export default function StudentTests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const tests = (DB.get('tests') || []).filter((t) => t.groupIds.includes(user.groupId));
  const results = (DB.get('results') || []).filter((r) => r.userId === user.id);

  return (
    <div className="tests-section">
      <h2>Менің тесттерім</h2>

      {tests.length === 0 && <p className="empty-state">Сіздің топ үшін тест жоқ</p>}

      {tests.map((t) => {
        const myResult = results.find((r) => r.testId === t.id);
        return (
          <div className="card" key={t.id}>
            <h4>{t.title}</h4>
            <p>{t.questions.length} сұрақ</p>
            {myResult ? (
              <>
                <p className="score">
                  Нәтиже: <strong>{myResult.score}/{myResult.total}</strong> ({Math.round((myResult.score / myResult.total) * 100)}%)
                </p>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/student/tests/results/${t.id}`)}>
                  📋 Жауаптарды қарау
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => navigate(`/student/tests/take/${t.id}`)}>
                Тестті бастау
              </button>
            )}
          </div>
        );
      })}

      {results.length > 0 && (
        <>
          <h3>Нәтижелер тарихы</h3>
          <div className="results-grid">
            {results.map((r, i) => {
              const test = (DB.get('tests') || []).find((t) => t.id === r.testId);
              return (
                <div className="card result-card" key={i}>
                  <strong>{test?.title || 'Тест жойылған'}</strong>
                  <span className="score">{r.score}/{r.total}</span>
                  <span className="date">{new Date(r.date).toLocaleDateString('kk')}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
