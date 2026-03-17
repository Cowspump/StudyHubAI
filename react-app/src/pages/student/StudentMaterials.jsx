import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DB from '../../utils/db';
import MaterialModal from '../../components/MaterialModal';

export default function StudentMaterials() {
  const { user } = useAuth();
  const materials = (DB.get('materials') || []).filter((m) => m.groupIds.includes(user.groupId));
  const [previewMaterial, setPreviewMaterial] = useState(null);

  const typeIcon = { pdf: '📄', video: '🎬', link: '🔗', file: '📁' };

  const byTopic = {};
  materials.forEach((m) => {
    if (!byTopic[m.topic]) byTopic[m.topic] = [];
    byTopic[m.topic].push(m);
  });

  return (
    <div className="materials-section">
      <h2>Курс материалдары</h2>

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
