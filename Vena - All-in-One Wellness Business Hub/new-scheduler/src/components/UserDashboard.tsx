import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { VenaLogo, SignOutIcon, PlusIcon, EditIcon, TrashIcon } from './Icons';
import AvailabilityEditor from './AvailabilityEditor';
import { Link } from 'react-router-dom';

type AvailabilityWindow = {
  id: string;
  weekday: number;
  start_minute: number;
  end_minute: number;
  slot_minutes: number;
};

type Schedule = {
  id: string;
  slug: string;
  title: string;
  timezone: string;
  edit_token: string;
};

export default function UserDashboard({ user }: { user: User }) {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [availabilityWindows, setAvailabilityWindows] = useState<AvailabilityWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [timezone, setTimezone] = useState('Asia/Jerusalem');
  const schedulerBaseHref =
    typeof window !== 'undefined'
      ? new URL(import.meta.env.BASE_URL ?? '/', window.location.origin).href.replace(/\/$/, '')
      : '';

  const weekdays = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  useEffect(() => {
    loadUserSchedule();
  }, [user]);

  const loadUserSchedule = async () => {
    try {
      console.log('Loading schedule for user:', user.id);

      // First, try to find existing schedule for this user
      const { data: existingSchedule, error: scheduleError } = await supabase
        .from('scheduler_schedules')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (scheduleError && scheduleError.code !== 'PGRST116') {
        console.error('Error loading schedule:', scheduleError);
        alert(`Error loading schedule: ${scheduleError.message}`);
        return;
      }

      if (existingSchedule) {
        console.log('Found existing schedule:', existingSchedule);
        setSchedule(existingSchedule);
        setTitle(existingSchedule.title);
        setTimezone(existingSchedule.timezone);

        // Load availability windows
        const { data: windows, error: windowsError } = await supabase
          .from('scheduler_availability_windows')
          .select('*')
          .eq('schedule_id', existingSchedule.id)
          .order('weekday')
          .order('start_minute');

        if (windowsError) {
          console.error('Error loading availability:', windowsError);
          alert(`Error loading availability: ${windowsError.message}`);
        } else {
          console.log('Loaded availability windows:', windows);
          setAvailabilityWindows(windows || []);
        }
      } else {
        console.log('No schedule found, creating new one...');
        // Create a new schedule for the user
        await createUserSchedule();
      }
    } catch (error) {
      console.error('Error in loadUserSchedule:', error);
      alert(`Error loading schedule: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createUserSchedule = async () => {
    try {
      const scheduleSlug = user.email?.split('@')[0] || `user-${user.id.slice(0, 8)}`;

      // Generate a random edit token
      const editToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      const { data: newSchedule, error } = await supabase
        .from('scheduler_schedules')
        .insert({
          owner_id: user.id,
          slug: scheduleSlug,
          title: `${user.user_metadata?.full_name || user.email?.split('@')[0] || 'My'} Schedule`,
          timezone: 'Asia/Jerusalem',
          edit_token: editToken
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating schedule:', error);
        return;
      }

      setSchedule(newSchedule);
      setTitle(newSchedule.title);
      setTimezone(newSchedule.timezone);
    } catch (error) {
      console.error('Error creating schedule:', error);
    }
  };

  const updateSchedule = async () => {
    if (!schedule) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('scheduler_schedules')
        .update({
          title,
          timezone
        })
        .eq('id', schedule.id);

      if (error) {
        console.error('Error updating schedule:', error);
        alert('Error updating schedule');
      } else {
        setSchedule({ ...schedule, title, timezone });
        alert('Schedule updated successfully!');
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Error updating schedule');
    } finally {
      setSaving(false);
    }
  };

  const addAvailabilityWindow = async (weekday: number, startHour: number = 9, endHour: number = 17, slotMinutes: number = 60) => {
    if (!schedule) return;

    try {
      console.log('Adding availability window for day:', weekday, 'schedule:', schedule.id);

      const { data, error } = await supabase
        .from('scheduler_availability_windows')
        .insert({
          schedule_id: schedule.id,
          weekday,
          start_minute: startHour * 60,
          end_minute: endHour * 60,
          slot_minutes: slotMinutes
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error adding availability:', error);
        alert(`Error: ${error.message} (Code: ${error.code})`);
      } else {
        console.log('Successfully added availability window:', data);
        setAvailabilityWindows([...availabilityWindows, data]);
      }
    } catch (error) {
      console.error('Error adding availability:', error);
      alert('Error adding availability window');
    }
  };

  const updateAvailabilityWindow = async (windowId: string, updates: Partial<AvailabilityWindow>) => {
    try {
      const { error } = await supabase
        .from('scheduler_availability_windows')
        .update(updates)
        .eq('id', windowId);

      if (error) {
        console.error('Error updating availability:', error);
        alert('Error updating availability window');
      } else {
        setAvailabilityWindows(availabilityWindows.map(w =>
          w.id === windowId ? { ...w, ...updates } : w
        ));
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Error updating availability window');
    }
  };

  const removeAvailabilityWindow = async (windowId: string) => {
    try {
      const { error } = await supabase
        .from('scheduler_availability_windows')
        .delete()
        .eq('id', windowId);

      if (error) {
        console.error('Error removing availability:', error);
        alert('Error removing availability window');
      } else {
        setAvailabilityWindows(availabilityWindows.filter(w => w.id !== windowId));
      }
    } catch (error) {
      console.error('Error removing availability:', error);
      alert('Error removing availability window');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your scheduler...</p>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading schedule. Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <VenaLogo className="w-8 h-8" />
              <h1 className="text-xl font-semibold text-gray-900">My Scheduler</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.user_metadata?.full_name || user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <SignOutIcon className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Schedule Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="My Schedule"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Asia/Jerusalem">Asia/Jerusalem</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
                <option value="Australia/Sydney">Australia/Sydney</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={updateSchedule}
              disabled={saving}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Schedule'}
            </button>
          </div>
        </div>

        {/* Public URL */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Public Scheduling Page</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={`${schedulerBaseHref}/${schedule.slug}`}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
            <button
              onClick={() => navigator.clipboard.writeText(`${schedulerBaseHref}/${schedule.slug}`)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Copy
            </button>
            <Link
              to={`/${schedule.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 inline-block"
            >
              View Page
            </Link>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Share this URL with your clients so they can book appointments with you.
          </p>
        </div>

        {/* Availability Windows */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Availability Windows</h2>
            <div className="text-sm text-gray-600">
              {availabilityWindows.length} window(s) configured
            </div>
          </div>

          <AvailabilityEditor
            windows={availabilityWindows}
            onAdd={addAvailabilityWindow}
            onRemove={removeAvailabilityWindow}
            onUpdate={updateAvailabilityWindow}
          />
        </div>
      </div>
    </div>
  );
}
