import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DB from '../../utils/db';
import { explainAnswer } from '../../utils/openai';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function TestResults() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const test = (DB.get('tests') || []).find((t) => t.id === testId);
  const results = DB.get('results') || [];
  const myResult = results.filter((r) => r.testId === testId && r.userId === user.id).pop();

  const [explanations, setExplanations] = useState({});
  const [loadingIdx, setLoadingIdx] = useState(null);

  if (!test || !myResult?.answers) {
    return (
      <div className="test-taking">
        <p>Нәтиже табылмады</p>
        <button className="btn btn-primary" onClick={() => navigate('/student/tests')}>← Тесттерге оралу</button>
      </div>
    );
  }

  const { answers: userAnswers, score } = myResult;
  const total = test.questions.length;
  const pct = Math.round((score / total) * 100);
  const color = pct >= 70 ? 'var(--success)' : pct >= 50 ? '#f59e0b' : 'var(--danger)';

  const handleExplain = async (qIdx) => {
    const q = test.questions[qIdx];
    setLoadingIdx(qIdx);
    try {
      const explanation = await explainAnswer(q, userAnswers[qIdx], q.answer);
      setExplanations((prev) => ({ ...prev, [qIdx]: explanation }));
    } catch (err) {
      setExplanations((prev) => ({ ...prev, [qIdx]: `❌ Қате: ${err.message}` }));
    } finally {
      setLoadingIdx(null);
    }
  };

  return (
    <div className="test-taking">
      <div className="result-banner" style={{ borderTop: `4px solid ${color}` }}>
        <div className="result-score" style={{ color }}>{pct}%</div>
        <div className="result-fraction">{score} / {total} дұрыс жауап</div>
        <div className="result-message">
          {pct >= 70 ? '🎉 Жарайсың!' : pct >= 50 ? '📚 Жақсы, бірақ жақсарту қажет' : '⚠️ Материалды қайта оқу ұсынылады'}
        </div>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Сұрақтарды талдау</h3>

      {test.questions.map((q, i) => {
        const userAns = userAnswers[i];
        const correct = userAns === q.answer;
        const icon = correct ? '✅' : '❌';

        return (
          <div className={`review-card ${correct ? 'correct' : 'wrong'}`} key={i}>
            <div className="q-header">
              <span className="q-number" style={{ background: correct ? 'var(--success)' : 'var(--danger)' }}>{i + 1}</span>
              <span className="q-text">{icon} {q.q}</span>
            </div>

            {q.opts.map((o, j) => {
              let cls = 'review-option';
              let mark = '';
              if (j === q.answer) { cls += ' is-correct'; mark = '✓'; }
              else if (j === userAns && !correct) { cls += ' is-wrong'; mark = '✗'; }
              return (
                <div className={cls} key={j}>
                  <span
                    className="option-letter"
                    style={
                      j === q.answer
                        ? { background: 'var(--success)', color: '#fff' }
                        : j === userAns && !correct
                        ? { background: 'var(--danger)', color: '#fff' }
                        : {}
                    }
                  >
                    {mark || LETTERS[j]}
                  </span>
                  <span>{o}</span>
                </div>
              );
            })}

            {!correct && (
              <div style={{ marginTop: '0.75rem' }}>
                {!explanations[i] && (
                  <button
                    className="btn btn-sm"
                    onClick={() => handleExplain(i)}
                    disabled={loadingIdx === i}
                    style={{ background: '#8b5cf6', color: '#fff' }}
                  >
                    {loadingIdx === i ? '⏳ ИИ ойлануда...' : '🤖 Неліктен? (ИИ түсіндірсін)'}
                  </button>
                )}
                {explanations[i] && (
                  <div style={{ background: '#f3f0ff', borderRadius: 8, padding: 12, border: '1px solid #ddd6fe' }}>
                    <strong>🤖 ИИ түсіндірмесі:</strong>
                    <p style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>{explanations[i]}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div className="test-submit-area">
        <button className="btn btn-primary" onClick={() => navigate('/student/tests')}>← Тесттерге оралу</button>
      </div>
    </div>
  );
}
