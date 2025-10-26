import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const SignInForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resetMode, setResetMode] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 Form submitted, starting sign in process...');
    
    setLoading(true);
    setError('');
    setSuccessMessage('');

    console.log('📧 Attempting sign in with email:', email);
    console.log('🔗 Supabase client:', supabase);

    try {
      console.log('🚀 Calling supabase.auth.signInWithPassword...');
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('📊 Sign in response:', { data, authError });

      if (authError) {
        console.error('❌ Auth error occurred:', authError);
        throw authError;
      }

      if (data.user) {
        console.log('✅ Sign in successful! User:', data.user);
        console.log('🔄 Setting success message and redirecting...');
        
        setSuccessMessage('Sign in successful! Redirecting...');
        
        // Get the session to transfer it
        const { data: { session } } = await supabase.auth.getSession();
        
        // Redirect with session tokens in URL
        setTimeout(() => {
          console.log('🎯 Redirecting to dashboard with session...');
          
          // Check if user wants to go to scheduler from URL parameter
          const urlParams = new URLSearchParams(window.location.search);
          const redirectTo = urlParams.get('redirect') || 'dashboard';
          
          if (session?.access_token) {
            // Include tokens in URL for cross-domain transfer
            if (redirectTo === 'scheduler') {
              window.location.href = `https://app.vena.software/scheduler?access_token=${session.access_token}&refresh_token=${session.refresh_token}`;
            } else {
              window.location.href = `https://app.vena.software/dashboard#access_token=${session.access_token}&refresh_token=${session.refresh_token}&type=access_token`;
            }
          } else {
            window.location.href = `https://app.vena.software/${redirectTo}`;
          }
        }, 1000);
      } else {
        console.warn('⚠️ No user returned from sign in');
        setError('Sign in failed. No user returned.');
      }
    } catch (err: any) {
      console.error('💥 Sign in error caught:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        code: err.code,
        details: err
      });
      
      // Handle specific error types
      if (err.message === 'Invalid login credentials') {
        setError('Invalid email or password. Please try again.');
      } else if (err.message === 'Email not confirmed') {
        setError('Please check your email and confirm your account before signing in.');
      } else if (err.message === 'Too many requests') {
        setError('Too many sign in attempts. Please wait a moment and try again.');
      } else {
        setError(`Sign in failed: ${err.message}`);
      }
    } finally {
      console.log('🏁 Sign in process finished');
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccessMessage('Password reset email sent! Check your inbox.');
      setResetMode(false);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

  const handleBlur = () => {
    setCapsLockOn(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your Vena account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                required
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {capsLockOn && (
              <p className="mt-1 text-sm text-amber-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Caps Lock is on.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setResetMode(true)}
              className="text-sm text-purple-600 hover:text-purple-500 font-medium"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium py-3 px-4 rounded-lg hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a
              href="https://app.vena.software/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-500 font-medium"
            >
              Sign up
            </a>
          </p>
        </div>

        {resetMode && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-3">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Email'}
            </button>
            <button
              onClick={() => setResetMode(false)}
              className="w-full mt-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignInForm;
