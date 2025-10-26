import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const IntegrationSettings = () => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { data, error } = await supabase.functions.invoke('save-reservekit-key', {
        body: JSON.stringify({ apiKey }),
      });

      if (error) {
        throw error;
      }

      setMessage(data.message || 'API Key saved successfully!');
      setApiKey(''); // Clear the field on success
    } catch (err: any) {
      console.error('Failed to save API key:', err);
      setError(`Error: ${err.message || 'Could not save API key.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800">Connect to ReserveKit</h2>
      <p className="text-center text-gray-600">
        Enter your ReserveKit API key below to sync your services with Vena. You can find your key in your ReserveKit settings under "API Keys".
      </p>
      <form onSubmit={handleSaveKey} className="space-y-6">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
            API Key
          </label>
          <input
            id="apiKey"
            type="password" // Use 'password' type to obscure the key as the user types
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="sk_rsv_..."
            required
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save and Connect'}
          </button>
        </div>
      </form>
      {message && <p className="mt-4 text-sm text-center text-green-600">{message}</p>}
      {error && <p className="mt-4 text-sm text-center text-red-600">{error}</p>}
    </div>
  );
};