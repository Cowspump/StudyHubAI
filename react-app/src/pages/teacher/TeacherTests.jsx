import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';
import DB from '../../utils/db';
import { getApiKey } from '../../utils/openai';
import { generateTest } from '../../utils/openai';

export default function TeacherTests() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [tests, setTests] = useState(DB.get('tests') || []);
  const groups = DB.get('groups') || [];
  const results = DB.get('results') || [];
  const materials = DB.get('materials') || [];

  // Manual form
  const [testTitle, setTestTitle] = useState('');
  const [testGroups, setTestGroups] = useState([]);
  const [questions, setQuestions] = useState([{ q: '', opts: ['', '', '', ''], answer: 0 }]);

  // AI form
  const [aiLecture, setAiLecture] = useState('');
  const [aiNumQ, setAiNumQ] = useState(10);
  const [aiTitle, setAiTitle] = useState('');
  const [aiGroups, setAiGroups] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState('');

  const toggleGroup = (gid, setter, current) => {
    setter(current.includes(gid) ? current.filter((id) => id !== gid) : [...current, gid]);
  };

  const addQuestion = () => {
    setQuestions([...questions, { q: '', opts: ['', '', '', ''], answer: 0 }]);
  };

  const updateQuestion = (idx, field, value) => {
    const updated = [...questions];
    if (field === 'q') updated[idx].q = value;
    else if (field === 'answer') updated[idx].answer = parseInt(value);
    else {
      const optIdx = parseInt(field);
      updated[idx].opts[optIdx] = value;
    }
    setQuestions(updated);
  };

  const handleCreateTest = (e) => {
    e.preventDefault();
    const allTests = DB.get('tests') || [];
    allTests.push({ id: 't' + DB.generateId(), title: testTitle, groupIds: testGroups, questions });
    DB.set('tests', allTests);
    setTests(allTests);
    setTestTitle('');
    setTestGroups([]);
    setQuestions([{ q: '', opts: ['', '', '', ''], answer: 0 }]);
  };

  const handleDelete = (id) => {
    const updated = tests.filter((t) => t.id !== id);
    DB.set('tests', updated);
    setTests(updated);
  };

  const handleAiGenerate = async (e) => {
    e.preventDefault();
    if (!aiLecture) return alert(t('selectLectureWarn'));
    if (aiGroups.length === 0) return alert(t('selectGroupWarn'));
    if (!getApiKey()) return alert(t('noApiKeyWarn'));

    setAiLoading(true);
    setAiStatus(t('aiGenerating'));

    try {
      const generatedQuestions = await generateTest(aiLecture, aiNumQ);
      const lecture = materials.find((m) => m.url === aiLecture);
      const title = aiTitle || `${t('aiTestDefault')}`;

      // Store in sessionStorage and navigate to preview
      sessionStorage.setItem('previewTest', JSON.stringify({
        title, groupIds: aiGroups, questions: generatedQuestions,
      }));
      navigate('/teacher/tests/preview');
    } catch (err) {
      setAiStatus(`${t('errorPrefix')} ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="tests-section">
      <h2>{t('testsAndTasks')}</h2>

      {/* AI generate */}
      <div className="card form-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
        <h3>{t('aiTestGen')}</h3>
        <form onSubmit={handleAiGenerate}>
          <label>{t('selectLecture')}</label>
          <select value={aiLecture} onChange={(e) => setAiLecture(e.target.value)} required>
            <option value="">{t('chooseLecture')}</option>
            {materials.map((m) => (
              <option key={m.id} value={m.url}>{m.title}</option>
            ))}
          </select>
          <label>{t('questionCount')}</label>
          <select value={aiNumQ} onChange={(e) => setAiNumQ(parseInt(e.target.value))}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
          <input
            type="text"
            placeholder={t('testNameAuto')}
            value={aiTitle}
            onChange={(e) => setAiTitle(e.target.value)}
          />
          <div className="checkbox-group">
            <label><strong>{t('groupsLabel')}</strong></label>
            {groups.map((g) => (
              <label key={g.id}>
                <input
                  type="checkbox"
                  checked={aiGroups.includes(g.id)}
                  onChange={() => toggleGroup(g.id, setAiGroups, aiGroups)}
                />
                {g.name}
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={aiLoading}
            style={{ background: '#8b5cf6' }}
          >
            {aiLoading ? t('generating') : t('generateAI')}
          </button>
          {aiStatus && <div style={{ marginTop: 10 }}><p style={{ color: aiStatus.startsWith('❌') ? '#e74c3c' : '#8b5cf6' }}>{aiStatus}</p></div>}
        </form>
      </div>

      {/* Manual */}
      <div className="card form-card">
        <h3>{t('manualCreate')}</h3>
        <form onSubmit={handleCreateTest}>
          <input
            type="text"
            placeholder={t('testName')}
            value={testTitle}
            onChange={(e) => setTestTitle(e.target.value)}
            required
          />
          <div className="checkbox-group">
            <label><strong>{t('groupsLabel')}</strong></label>
            {groups.map((g) => (
              <label key={g.id}>
                <input
                  type="checkbox"
                  checked={testGroups.includes(g.id)}
                  onChange={() => toggleGroup(g.id, setTestGroups, testGroups)}
                />
                {g.name}
              </label>
            ))}
          </div>
          <h4>{t('questions')}</h4>
          {questions.map((q, i) => (
            <div className="question-block" key={i}>
              <label>{t('question')} {i + 1}</label>
              <input
                type="text"
                placeholder={t('questionText')}
                value={q.q}
                onChange={(e) => updateQuestion(i, 'q', e.target.value)}
                required
              />
              {q.opts.map((opt, j) => (
                <input
                  key={j}
                  type="text"
                  placeholder={`${t('option')} ${j + 1}`}
                  value={opt}
                  onChange={(e) => updateQuestion(i, String(j), e.target.value)}
                  required
                />
              ))}
              <select value={q.answer} onChange={(e) => updateQuestion(i, 'answer', e.target.value)}>
                <option value={0}>{t('correctOption1')}</option>
                <option value={1}>{t('correctOption2')}</option>
                <option value={2}>{t('correctOption3')}</option>
                <option value={3}>{t('correctOption4')}</option>
              </select>
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={addQuestion}>{t('addQuestion')}</button>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>{t('createTest')}</button>
        </form>
      </div>

      <h3>{t('existingTests')}</h3>
      {tests.length === 0 && <p className="empty-state">{t('noTests')}</p>}

      {tests.map((tt) => {
        const testResults = results.filter((r) => r.testId === tt.id);
        const users = DB.get('users') || [];
        return (
          <div className="card" key={tt.id}>
            <div className="card-header">
              <h4>{tt.title}</h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-sm" onClick={() => navigate(`/teacher/tests/edit/${tt.id}`)} style={{ background: '#8b5cf6', color: '#fff' }}>
                  {t('edit')}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(tt.id)}>{t('delete')}</button>
              </div>
            </div>
            <p>
              {tt.questions.length} {t('questionsShort')}{' '}
              {tt.groupIds.map((gid) => groups.find((g) => g.id === gid)?.name || gid).join(', ')}
            </p>
            {testResults.length > 0 ? (
              <details>
                <summary>{t('results')} ({testResults.length})</summary>
                <table className="results-table">
                  <thead><tr><th>{t('student')}</th><th>{t('score')}</th><th>{t('date')}</th></tr></thead>
                  <tbody>
                    {testResults.map((r, i) => {
                      const stu = users.find((u) => u.id === r.userId);
                      return (
                        <tr key={i}>
                          <td>{stu?.name || 'N/A'}</td>
                          <td>{r.score}/{r.total}</td>
                          <td>{new Date(r.date).toLocaleDateString('kk')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </details>
            ) : (
              <p className="hint">{t('noResults')}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
