import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const VenaLogo: React.FC = () => (
  <img 
    src="/vena_logo.png" 
    alt="Vena Logo" 
    className="h-14 w-auto" 
  />
);

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#value', label: 'Why Vena?' },
    { href: '#cta', label: 'Contact' },
  ];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-purple-100 shadow-sm">
      {/* Subtle gradient line at top */}
      <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
      
      <div className="container mx-auto px-6 py-5">
        <div className="flex justify-between items-center">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <VenaLogo />
          </div>

          {/* Navigation - Ultra Clean Design */}
          <nav className="hidden md:flex items-center">
            <div className="flex items-center space-x-1 bg-slate-50 rounded-full p-1.5 border border-slate-100">
              {navLinks.map((link, index) => (
                <a 
                  key={link.label} 
                  href={link.href} 
                  className="relative px-4 py-2 text-slate-600 hover:text-slate-800 transition-all duration-300 font-light text-sm rounded-full hover:bg-white hover:shadow-sm group"
                >
                  {link.label}
                  {/* Subtle indicator dot */}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
              ))}
            </div>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/signin.html"
              className="text-sm px-5 py-2 rounded-full border border-slate-300 text-slate-700 hover:bg-white/60 hover:border-slate-400 transition-colors"
            >
              Sign In
            </a>
            <a
              href="https://app.vena.software/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium px-6 py-2.5 rounded-full hover:from-purple-500 hover:to-indigo-500 transition-all duration-400 shadow-sm hover:shadow-lg text-sm group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative">Sign Up</span>
            </a>
          </div>

          {/* Mobile Menu Button - Minimalist */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="relative w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 focus:outline-none transition-all duration-300 hover:bg-slate-100"
            >
              <div className="relative w-5 h-5 flex flex-col justify-center space-y-1">
                <div className={`h-px bg-slate-600 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-0.5' : 'w-5'}`}></div>
                <div className={`h-px bg-slate-600 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'w-4'}`}></div>
                <div className={`h-px bg-slate-600 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-0.5' : 'w-5'}`}></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Enhanced */}
      {isMenuOpen && (
        <div className="md:hidden">
          {/* Subtle separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          
          <div className="bg-white">
            <nav className="flex flex-col items-center space-y-1 px-6 py-6">
              {navLinks.map((link) => (
                <a 
                  key={link.label} 
                  href={link.href} 
                  className="w-full text-center py-3 text-slate-600 hover:text-slate-800 transition-colors duration-300 font-light rounded-lg hover:bg-slate-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              
              {/* Mobile Auth Buttons */}
              <div className="w-full pt-4 space-y-3">
                <a
                  href="signin.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center border border-slate-300 text-slate-700 px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </a>
                <a
                  href="https://app.vena.software/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium px-6 py-3 rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all duration-400 shadow-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </a>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;