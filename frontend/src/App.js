import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { ToastProvider } from './contexts/ToastContext';
import { AnnouncementProvider } from './contexts/AnnouncementContext';
import Login from './components/Login';
import LoginAlt from './components/LoginAlt';
import Signup from './components/Signup';
import Dashboard from './pages/Dashboard';
import PatientManagement from './components/PatientManagement';
import AIDiagnosis from './components/AIDiagnosis';
import DiagnosisHistory from './components/DiagnosisHistory';
import Statistics from './components/Statistics';
import MyPage from './components/MyPage';
import GuidePage from './components/GuidePage';
import TimelineSchedule from './pages/TimelineSchedule';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider> 
      <ToastProvider>
        <AnnouncementProvider>
          <Router>
            <div className="App">
              <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login-alt" element={<LoginAlt />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/patients" element={<PatientManagement />} />
              <Route path="/diagnosis" element={<AIDiagnosis />} />
              <Route path="/history" element={<DiagnosisHistory />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/guide" element={<GuidePage />} />
              <Route path="/schedule" element={<TimelineSchedule />} />
            </Routes>
          </div>
        </Router>
        </AnnouncementProvider>
      </ToastProvider>
    </ThemeProvider> 
  );
}

export default App;
