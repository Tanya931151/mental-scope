import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AIChat from './pages/AIChat';
import MoodTracker from './pages/MoodTracker';
import Journal from './pages/Journal';
import Emergency from './pages/Emergency';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import DoctorMap from './pages/DoctorMap';
import Facts from './pages/Facts';
import Meditation from './pages/Meditation';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
          <Route path="/mood" element={<ProtectedRoute><MoodTracker /></ProtectedRoute>} />
          <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/doctor-map" element={<ProtectedRoute><DoctorMap /></ProtectedRoute>} />
          <Route path="/facts" element={<Facts />} />
          <Route path="/meditation" element={<Meditation />} />

          <Route path="/emergency" element={<Emergency />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
