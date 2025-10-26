import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import ConfirmationMessage from './components/ConfirmationMessage';
import { IntegrationSettings } from './components/IntegrationSettings';
import TasksPage from './components/TasksPage';
import SchedulerPage from './components/SchedulerPage';
import VenaLogo from './components/icons/VenaLogo.png';

const RegistrationPage: React.FC = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');

  useEffect(() => {
    if (!isRegistered) {
      return;
    }

    const timeout = window.setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [isRegistered]);

  const handleSuccess = ({ email }: { email: string }) => {
    setRegisteredEmail(email);
    setIsRegistered(true);
  };

  return (
    <div className="min-h-screen bg-secondary flex items-start justify-center p-4 sm:p-6 lg:p-8">
      <main className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <div className="flex flex-col items-center text-center mb-8">
            <img
              src={VenaLogo}
              alt="Vena logo"
              className="h-16 w-auto mb-4 select-none"
              draggable="false"
            />
            {!isRegistered && (
              <>
                <h1 className="text-3xl sm:text-4xl font-bold text-zinc-800 tracking-tight leading-tight">
                  Ready to take your business to the next step?
                </h1>
                <p className="mt-3 text-sm sm:text-base text-zinc-600 max-w-md">
                  Start growing your wellness practice today - simplify scheduling, payments, and client engagement with Vena.
                </p>
              </>
            )}
          </div>
          {isRegistered ? (
            <>
              <ConfirmationMessage email={registeredEmail} />
              <p className="mt-4 text-sm text-zinc-600 text-center">
                We&apos;re redirecting you to your dashboard...
              </p>
              <div className="mt-8 border-t pt-8">
                <IntegrationSettings />
              </div>
            </>
          ) : (
            <RegistrationForm onSuccess={handleSuccess} />
          )}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegistrationPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/scheduler" element={<SchedulerPage />} />
      </Routes>
    </Router>
  );
};

export default App;

