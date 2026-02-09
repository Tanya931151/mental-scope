import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AIChat from './pages/AIChat';
import MoodTracker from './pages/MoodTracker';
import Journal from './pages/Journal';
import Emergency from './pages/Emergency';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/chat" element={<AIChat />} />
        <Route path="/mood" element={<MoodTracker />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}
