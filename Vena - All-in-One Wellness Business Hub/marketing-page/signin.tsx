import React from 'react';
import ReactDOM from 'react-dom/client';
import SignInForm from './components/SignInForm';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
      {/* Vena Logo */}
      <div className="flex justify-center mb-6">
        <img 
          src="/vena_logo.png" 
          alt="Vena Logo" 
          className="h-12 w-auto"
        />
      </div>
      
      <SignInForm />
      <p className="mt-6 text-center text-xs text-slate-500">© {new Date().getFullYear()} Vena. All rights reserved.</p>
    </div>
  </React.StrictMode>
);
