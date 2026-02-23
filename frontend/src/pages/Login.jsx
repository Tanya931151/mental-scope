import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Heart, Chrome } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';

export default function Login() {
  const navigate = useNavigate();
  const { login, googleSignIn, currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
      return;
    }

  }, [currentUser, navigate]);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setErrors({});
        setLoading(true);
        await login(formData.email, formData.password);
        navigate('/dashboard');
      } catch (err) {
        setErrors({ general: 'Failed to sign in. Please check your credentials.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await googleSignIn();
      navigate('/dashboard');
    } catch (err) {
      setErrors({ general: 'Failed to sign in with Google.' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F1FF] flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -ml-32 -mb-32" />
        {/* Logo & Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 relative z-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-lg border border-white/60">
            <Heart className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sign in to continue</p>
        </motion.div>

        {/* Login Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 backdrop-blur-xl rounded-[32px] shadow-2xl p-8 md:p-10 border border-white/60 relative z-10"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-11 pr-4 py-4 bg-white/50 border rounded-2xl focus:outline-none focus:ring-2 transition font-medium ${errors.email
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-white/80 focus:ring-purple-500'
                    }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-11 pr-12 py-4 bg-white/50 border rounded-2xl focus:outline-none focus:ring-2 transition font-medium ${errors.password
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-white/80 focus:ring-purple-500'
                    }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                Forgot password?
              </a>
            </div>

            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                {errors.general}
              </div>
            )}

            {/* Sign In Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white font-black text-sm uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-purple-100 hover:shadow-2xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </motion.button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-white shadow-sm text-gray-700 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-all"
            >
              <Chrome className="w-5 h-5" />
              Sign in with Google
            </motion.button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-purple-600 hover:text-purple-700 font-semibold">
              Sign up for free
            </Link>
          </p>
        </motion.div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          By signing in, you agree to our{' '}
          <a href="#" className="text-purple-600 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-purple-600 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
