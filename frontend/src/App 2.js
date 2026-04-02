import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import PatientManagement from './components/PatientManagement';
import AIDiagnosis from './components/AIDiagnosis';
import DiagnosisHistory from './components/DiagnosisHistory';
import Statistics from './components/Statistics';
import MyPage from './components/MyPage';
import GuidePage from './components/GuidePage';
import ThemeLangToggle from './components/ThemeLangToggle';

function App() {
  return (
    <Router>
      <div className="App">
        <ThemeLangToggle />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<PatientManagement />} />
          <Route path="/diagnosis" element={<AIDiagnosis />} />
          <Route path="/history" element={<DiagnosisHistory />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/guide" element={<GuidePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
