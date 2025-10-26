import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { VenaLogo, GoogleIcon } from './Icons';

export default function AuthForm() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    if (isSignUp) {
      // SIGN UP LOGIC
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // This is where the user will be sent after confirming their email
          emailRedirectTo: 'https://app.vena.software/',
        },
      });

      if (error) {
        alert(error.error_description || error.message);
      } else {
        alert('Check your email for the confirmation link!');
      }
    } else {
      // SIGN IN LOGIC
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.error_description || error.message);
      }
      // On successful sign-in, the listener in App.tsx will automatically show the tasks page.
    }

    setLoading(false);
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirect to the main app after Google sign-in
        redirectTo: 'https://app.vena.software/',
      },
    });
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
      <div className="flex justify-center">
        <VenaLogo className="w-24" />
      </div>
      <h2 className="text-2xl font-bold text-center text-gray-800">
        {isSignUp ? 'Create an Account' : 'Sign In to Your Account'}
      </h2>

      <button
        onClick={signInWithGoogle}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <GoogleIcon className="w-5 h-5" />
        <span className="text-sm font-medium text-gray-700">Sign in with Google</span>
      </button>

      <div className="flex items-center">
        <hr className="w-full border-gray-300" />
        <span className="px-2 text-sm text-gray-500">OR</span>
        <hr className="w-full border-gray-300" />
      </div>

      <form className="space-y-4" onSubmit={handleAuth}>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-700 sr-only">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full px-4 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-gray-700 sr-only">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full px-4 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </div>
      </form>

      <p className="text-sm text-center text-gray-600">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="ml-1 font-medium text-purple-600 hover:text-purple-500"
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
}