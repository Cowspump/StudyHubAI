import { useState } from 'react';
import DB from '../../utils/db';
import MaterialModal from '../../components/MaterialModal';

export default function TeacherMaterials() {
  const [materials, setMaterials] = useState(DB.get('materials') || []);
  const groups = DB.get('groups') || [];
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('pdf');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [previewMaterial, setPreviewMaterial] = useState(null);

  const typeIcon = { pdf: '📄', video: '🎬', link: '🔗', file: '📁' };

  const byTopic = {};
  materials.forEach((m) => {
    if (!byTopic[m.topic]) byTopic[m.topic] = [];
    byTopic[m.topic].push(m);
  });

  const toggleGroup = (gid) => {
    setSelectedGroups((prev) =>
      prev.includes(gid) ? prev.filter((id) => id !== gid) : [...prev, gid]
    );
  };

  const saveMaterial = (mType, mUrl, fileName) => {
    const entry = {
      id: 'm' + DB.generateId(),
      topic, title, type: mType, url: mUrl, groupIds: selectedGroups,
    };
    if (fileName) entry.fileName = fileName;
    const updated = [...materials, entry];
    DB.set('materials', updated);
    setMaterials(updated);
    setTopic(''); setTitle(''); setUrl(''); setFile(null); setSelectedGroups([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'file') {
      if (!file) return alert('Файлды таңдаңыз');
      const reader = new FileReader();
      reader.onload = () => saveMaterial(file.name.split('.').pop().toLowerCase(), reader.result, file.name);
      reader.readAsDataURL(file);
    } else {
      saveMaterial(type, url);
    }
  };

  const handleDelete = (id) => {
    const updated = materials.filter((m) => m.id !== id);
    DB.set('materials', updated);
    setMaterials(updated);
  };

  return (
    <div className="materials-section">
      <h2>Курс материалдары</h2>

      <div className="card form-card">
        <h3>Материал қосу</h3>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Тақырып" value={topic} onChange={(e) => setTopic(e.target.value)} required />
          <input type="text" placeholder="Атауы" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="pdf">PDF</option>
            <option value="video">Бейне (YouTube embed URL)</option>
            <option value="link">Сілтеме</option>
            <option value="file">Компьютерден файл</option>
          </select>
          {type !== 'file' ? (
            <input type="url" placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} required />
          ) : (
            <div>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.jpg,.png"
                onChange={(e) => setFile(e.target.files[0])}
              />
              {file && <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#666' }}>{file.name}</p>}
            </div>
          )}
          <div className="checkbox-group">
            {groups.map((g) => (
              <label key={g.id}>
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(g.id)}
                  onChange={() => toggleGroup(g.id)}
                />
                {g.name}
              </label>
            ))}
          </div>
          <button type="submit" className="btn btn-primary">Қосу</button>
        </form>
      </div>

      {Object.keys(byTopic).length === 0 && <p className="empty-state">Материалдар әлі қосылмаған</p>}

      {Object.entries(byTopic).map(([topicName, items]) => (
        <div className="topic-group" key={topicName}>
          <h3>{topicName}</h3>
          <div className="materials-grid">
            {items.map((m) => (
              <div className="card material-card" key={m.id}>
                <span className="material-icon">{typeIcon[m.type] || '📁'}</span>
                <div className="material-info">
                  <strong>{m.title}</strong>
                  <span className={`badge badge-${m.type}`}>{m.type.toUpperCase()}</span>
                </div>
                {m.type === 'video' ? (
                  <div className="video-embed">
                    <iframe src={m.url} allowFullScreen title={m.title} />
                  </div>
                ) : (
                  <button className="btn btn-sm" onClick={() => setPreviewMaterial(m)}>Ашу</button>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)}>Жою</button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {previewMaterial && (
        <MaterialModal material={previewMaterial} onClose={() => setPreviewMaterial(null)} />
      )}
    </div>
  );
}
