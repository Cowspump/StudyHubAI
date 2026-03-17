import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DB from '../../utils/db';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function TakeTest() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const test = (DB.get('tests') || []).find((t) => t.id === testId);
  const [answers, setAnswers] = useState({});

  if (!test) return <p>Тест табылмады</p>;

  const total = test.questions.length;
  const answeredCount = Object.keys(answers).length;

  const handleSelect = (qIdx, optIdx) => {
    setAnswers({ ...answers, [qIdx]: optIdx });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let score = 0;
    const answerArray = [];
    test.questions.forEach((q, i) => {
      const userAnswer = answers[i] ?? -1;
      if (userAnswer === q.answer) score++;
      answerArray.push(userAnswer);
    });

    const results = DB.get('results') || [];
    results.push({
      testId, userId: user.id, score, total: test.questions.length,
      date: Date.now(), answers: answerArray,
    });
    DB.set('results', results);
    navigate(`/student/tests/results/${testId}`);
  };

  return (
    <div className="test-taking">
      <h2>{test.title}</h2>
      <div className="test-counter">{answeredCount} / {total} жауап берілді</div>
      <div className="test-progress">
        <div className="test-progress-bar" style={{ width: `${(answeredCount / total) * 100}%` }} />
      </div>

      <form onSubmit={handleSubmit}>
        {test.questions.map((q, i) => (
          <div className="question-card" key={i}>
            <div className="q-header">
              <span className="q-number">{i + 1}</span>
              <span className="q-text">{q.q}</span>
            </div>
            <div className="option-group">
              {q.opts.map((o, j) => (
                <label className="option-label" key={j}>
                  <input
                    type="radio"
                    name={`q${i}`}
                    checked={answers[i] === j}
                    onChange={() => handleSelect(i, j)}
                    required={answers[i] === undefined}
                  />
                  <span className="option-letter">{LETTERS[j]}</span>
                  <span className="option-text">{o}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="test-submit-area">
          <button type="submit" className="btn btn-primary">Жіберу</button>
        </div>
      </form>
    </div>
  );
}
