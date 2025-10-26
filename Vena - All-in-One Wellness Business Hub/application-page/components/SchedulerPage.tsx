import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import UserDashboard from './scheduler/UserDashboard';
import { Session } from '@supabase/supabase-js';

// A simple loading component
const LoadingSpinner: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div>Loading Scheduler...</div>
  </div>
);

// A component to show when the user needs to complete their profile
const CompleteProfileRedirect: React.FC = () => {
  useEffect(() => {
    // Redirect to the main dashboard to complete profile setup
    window.location.href = '/dashboard';
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <p>Your profile is not complete.</p>
      <p>Redirecting you to the dashboard to finish setup...</p>
    </div>
  );
};

const SchedulerPage: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profileExists, setProfileExists] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      // 1. Check for an active session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        // 2. If logged in, check if a profile exists in the 'registrations' table
        const { data: profile, error } = await supabase
          .from('registrations')
          .select('id')
          .eq('id', session.user.id)
          .single();
        
        if (profile && !error) {
          setProfileExists(true);
        }
      }
      setLoading(false);
    };

    checkUserStatus();

    // Listen for auth changes to keep the session up to date
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      // Re-check profile status on auth change
      setLoading(true);
      checkUserStatus();
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // Show a loading indicator while we check everything
  if (loading) {
    return <LoadingSpinner />;
  }

  // If the user is logged in BUT their profile doesn't exist, redirect them.
  if (session && !profileExists) {
    return <CompleteProfileRedirect />;
  }

  // If the user is logged in AND their profile exists, show the scheduler dashboard.
  if (session && profileExists) {
    return <UserDashboard />;
  }

  // If no user is logged in, you can show a public view or a login form.
  // For now, we'll just show a message.
  return <div>Public scheduler view or login goes here.</div>;
};

export default SchedulerPage;