import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import ConfirmationMessage from './components/ConfirmationMessage';
import TasksPage from './components/TasksPage';
import VenaLogo from './components/icons/VenaLogo.png';

// Your existing registration app component - UNCHANGED
const RegistrationApp: React.FC = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');

  const handleSuccess = ({ email }: { email: string }) => {
    setIsRegistered(true);
    setRegisteredEmail(email);
    // Wait for 3 seconds before redirecting
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img src={VenaLogo} alt="Vena logo" className="mx-auto h-12 w-auto" />
        </div>
        {isRegistered ? (
          <>
            <ConfirmationMessage email={registeredEmail} />
            <p className="mt-4 text-sm text-zinc-600 text-center">
              We're redirecting you to your dashboard...
            </p>
          </>
        ) : (
          <RegistrationForm onSuccess={handleSuccess} />
        )}
      </div>
    </div>
  );
};

// New routing wrapper - ONLY ADDS functionality
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegistrationApp />} />
        <Route path="/tasks" element={<TasksPage />} />
      </Routes>
    </Router>
  );
};

// Your existing render code - UNCHANGED
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

