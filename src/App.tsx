import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FoodLog from './pages/FoodLog';
import ExerciseLog from './pages/ExerciseLog';
import BodyMetrics from './pages/BodyMetrics';
import Analysis from './pages/Analysis';
import UserManage from './pages/UserManage';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/food" element={<FoodLog />} />
          <Route path="/exercise" element={<ExerciseLog />} />
          <Route path="/metrics" element={<BodyMetrics />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/users" element={<UserManage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
