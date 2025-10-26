import React from 'react';
import CheckCircleIcon from './icons/CheckCircleIcon';

type ConfirmationMessageProps = {
  email: string;
  logoUrl?: string;
};

const ConfirmationMessage: React.FC<ConfirmationMessageProps> = ({ email, logoUrl }) => {
  return (
    <div className="text-center py-8 animate-fade-in">
      <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-6">
        {logoUrl ? (
          <img src={logoUrl} alt="Business Logo" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <CheckCircleIcon className="h-12 w-12 text-primary" />
        )}
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-zinc-800">Welcome to Vena!</h2>
      <p className="mt-4 text-zinc-600">
        Your account has been created for <strong className="font-medium text-zinc-800">{email}</strong>.
      </p>
    </div>
  );
};

export default ConfirmationMessage;