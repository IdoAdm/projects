import React from 'react';

const VenaLogo: React.FC = () => (
    <img src="/vena_logo.png" alt="Vena Logo" className="h-7 w-auto" />
);
const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-stone-200">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-4 md:mb-0">
            <VenaLogo />
          </div>
          <div className="text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} Vena. All rights reserved.</p>
            <p className="font-semibold text-slate-600">vena.software</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;