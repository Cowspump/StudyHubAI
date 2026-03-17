import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DB from '../../utils/db';

export default function TestEditPreview() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [groupIds, setGroupIds] = useState([]);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (testId) {
      // Editing existing test
      const tests = DB.get('tests') || [];
      const test = tests.find((t) => t.id === testId);
      if (test) {
        setTitle(test.title);
        setGroupIds(test.groupIds);
        setQuestions(test.questions);
      }
    } else {
      // Preview from AI generation
      const data = sessionStorage.getItem('previewTest');
      if (data) {
        const parsed = JSON.parse(data);
        setTitle(parsed.title);
        setGroupIds(parsed.groupIds);
        setQuestions(parsed.questions);
        sessionStorage.removeItem('previewTest');
      }
    }
  }, [testId]);

  const updateQuestion = (idx, field, value) => {
    const updated = [...questions];
    if (field === 'q') updated[idx] = { ...updated[idx], q: value };
    else if (field === 'answer') updated[idx] = { ...updated[idx], answer: parseInt(value) };
    else {
      const optIdx = parseInt(field);
      const newOpts = [...updated[idx].opts];
      newOpts[optIdx] = value;
      updated[idx] = { ...updated[idx], opts: newOpts };
    }
    setQuestions(updated);
  };

  const removeQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (questions.length === 0) return alert('Кем дегенде бір сұрақ болуы керек!');
    if (!title.trim()) return alert('Тест атауын енгізіңіз!');

    const tests = DB.get('tests') || [];

    if (testId) {
      const idx = tests.findIndex((t) => t.id === testId);
      if (idx !== -1) {
        tests[idx] = { ...tests[idx], title, groupIds, questions };
      }
    } else {
      tests.push({ id: 't' + DB.generateId(), title, groupIds, questions });
    }

    DB.set('tests', tests);
    navigate('/teacher/tests');
  };

  return (
    <div className="tests-section">
      <h2>Сұрақтарды тексеру және өңдеу</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Сұрақтарды тексеріңіз. Қажет болса мәтінді өңдеңіз, сұрақтарды жойыңыз немесе дұрыс жауапты өзгертіңіз.
      </p>

      <div className="card form-card" style={{ borderLeft: '4px solid #8b5cf6', marginBottom: '1rem' }}>
        <label><strong>Тест атауы:</strong></label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      {questions.map((q, i) => (
        <div className="card edit-question-block" key={i} style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div className="card-header">
            <label><strong>Сұрақ {i + 1}</strong></label>
            <button className="btn btn-danger btn-sm" onClick={() => removeQuestion(i)}>Жою</button>
          </div>
          <input
            type="text"
            value={q.q}
            onChange={(e) => updateQuestion(i, 'q', e.target.value)}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
            {q.opts.map((opt, j) => (
              <input
                key={j}
                type="text"
                value={opt}
                onChange={(e) => updateQuestion(i, String(j), e.target.value)}
                placeholder={`Нұсқа ${j + 1}`}
              />
            ))}
          </div>
          <select
            value={q.answer}
            onChange={(e) => updateQuestion(i, 'answer', e.target.value)}
            style={{ marginTop: '0.5rem' }}
          >
            <option value={0}>Дұрыс: Нұсқа 1</option>
            <option value={1}>Дұрыс: Нұсқа 2</option>
            <option value={2}>Дұрыс: Нұсқа 3</option>
            <option value={3}>Дұрыс: Нұсқа 4</option>
          </select>
        </div>
      ))}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
        <button className="btn btn-primary" onClick={handleSave} style={{ background: '#8b5cf6' }}>
          Тестті сақтау
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/teacher/tests')}>
          Бас тарту
        </button>
      </div>
    </div>
  );
}
