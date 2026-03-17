import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import TeacherHome from './TeacherHome';
import TeacherGroups from './TeacherGroups';
import TeacherMaterials from './TeacherMaterials';
import TeacherTests from './TeacherTests';
import TeacherMessages from './TeacherMessages';
import TestEditPreview from './TestEditPreview';

const links = [
  { to: '/teacher', label: 'Басты бет', end: true },
  { to: '/teacher/groups', label: 'Топтар' },
  { to: '/teacher/materials', label: 'Материалдар' },
  { to: '/teacher/tests', label: 'Тесттер' },
  { to: '/teacher/messages', label: 'Хабарламалар', showUnread: true },
];

export default function TeacherDashboard() {
  return (
    <div className="dashboard">
      <Sidebar links={links} />
      <main className="main-content">
        <Routes>
          <Route index element={<TeacherHome />} />
          <Route path="groups" element={<TeacherGroups />} />
          <Route path="materials" element={<TeacherMaterials />} />
          <Route path="tests" element={<TeacherTests />} />
          <Route path="tests/edit/:testId" element={<TestEditPreview />} />
          <Route path="tests/preview" element={<TestEditPreview />} />
          <Route path="messages" element={<TeacherMessages />} />
        </Routes>
      </main>
    </div>
  );
}
