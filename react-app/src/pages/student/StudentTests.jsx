import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import DB from '../../utils/db';

export default function StudentTests() {
  const { user } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const tests = (DB.get('tests') || []).filter((ts) => ts.groupIds.includes(user.groupId));
  const results = (DB.get('results') || []).filter((r) => r.userId === user.id);

  return (
    <div className="tests-section">
      <h2>{t('myTests')}</h2>

      {tests.length === 0 && <p className="empty-state">{t('noTestsForGroup')}</p>}

      {tests.map((ts) => {
        const myResult = results.find((r) => r.testId === ts.id);
        return (
          <div className="card" key={ts.id}>
            <h4>{ts.title}</h4>
            <p>{ts.questions.length} {t('questionWord')}</p>
            {myResult ? (
              <>
                <p className="score">
                  {t('resultLabel')} <strong>{myResult.score}/{myResult.total}</strong> ({Math.round((myResult.score / myResult.total) * 100)}%)
                </p>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/student/tests/results/${ts.id}`)}>
                  {t('viewAnswers')}
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => navigate(`/student/tests/take/${ts.id}`)}>
                {t('startTest')}
              </button>
            )}
          </div>
        );
      })}

      {results.length > 0 && (
        <>
          <h3>{t('resultsHistory')}</h3>
          <div className="results-grid">
            {results.map((r, i) => {
              const test = (DB.get('tests') || []).find((ts) => ts.id === r.testId);
              return (
                <div className="card result-card" key={i}>
                  <strong>{test?.title || t('testDeleted')}</strong>
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
