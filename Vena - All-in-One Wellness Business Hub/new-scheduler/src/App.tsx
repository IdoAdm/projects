import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useParams, Link } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { PublicScheduleView } from './components/PublicScheduleView';
import UserDashboard from './components/UserDashboard';
import AuthForm from './components/AuthForm';
import { VenaLogo } from './components/Icons';

function SchedulePage() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) {
    return <div>Invalid slug</div>;
  }
  return <PublicScheduleView slug={slug} />;
}

function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && user) {
      // If user is authenticated, redirect to their dashboard
      return;
    }
    loadSchedules();
  }, [loading, user]);

  const loadSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduler_schedules')
        .select('slug, title')
        .limit(10);

      if (error) {
        console.error('Error loading schedules:', error);
        setSchedules([]);
      } else {
        setSchedules(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show their dashboard
  if (user) {
    return <UserDashboard user={user} />;
  }

  // If user is not authenticated, show public landing page
  if (loadingSchedules) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scheduler...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <VenaLogo className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scheduler</h1>
          <p className="text-gray-600">Book appointments and manage your schedule</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sign In to Manage Your Schedule</h2>
          <p className="text-gray-600 mb-4">
            Create your own scheduling page where clients can book appointments with you.
          </p>
          <AuthForm />
        </div>

        {schedules.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Schedules</h2>
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div key={schedule.slug} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <h3 className="font-medium text-gray-900">{schedule.title}</h3>
                    <p className="text-sm text-gray-500">/{schedule.slug}</p>
                  </div>
                  <Link
                    to={`/${schedule.slug}`}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    View Schedule
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">No Schedules Found</h2>
            <p className="text-gray-600 mb-4">No public schedules are available at the moment.</p>
            <Link
              to="/test-schedule"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-block"
            >
              Try Test Schedule
            </Link>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Schedule</h2>
          <p className="text-gray-600 mb-4">Try the test schedule to see how the booking system works.</p>
          <Link
            to="/test-schedule"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-block"
          >
            Open Test Schedule
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  const rawBase = import.meta.env.BASE_URL ?? '/';
  const normalizedBase = rawBase === '/' ? '/' : rawBase.replace(/\/+$/, '');
  const routerBase = normalizedBase === '/' ? undefined : normalizedBase;

  return (
    <BrowserRouter basename={routerBase}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:slug" element={<SchedulePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
