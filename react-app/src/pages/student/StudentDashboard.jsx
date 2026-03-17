import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import StudentHome from './StudentHome';
import StudentMaterials from './StudentMaterials';
import StudentTests from './StudentTests';
import StudentAI from './StudentAI';
import StudentMessages from './StudentMessages';
import TakeTest from './TakeTest';
import TestResults from './TestResults';

const links = [
  { to: '/student', label: 'Басты бет', end: true },
  { to: '/student/materials', label: 'Материалдар' },
  { to: '/student/tests', label: 'Тесттер' },
  { to: '/student/ai', label: 'ИИ-көмекші' },
  { to: '/student/messages', label: 'Хабарламалар', showUnread: true },
];

export default function StudentDashboard() {
  return (
    <div className="dashboard">
      <Sidebar links={links} />
      <main className="main-content">
        <Routes>
          <Route index element={<StudentHome />} />
          <Route path="materials" element={<StudentMaterials />} />
          <Route path="tests" element={<StudentTests />} />
          <Route path="tests/take/:testId" element={<TakeTest />} />
          <Route path="tests/results/:testId" element={<TestResults />} />
          <Route path="ai" element={<StudentAI />} />
          <Route path="messages" element={<StudentMessages />} />
        </Routes>
      </main>
    </div>
  );
}
