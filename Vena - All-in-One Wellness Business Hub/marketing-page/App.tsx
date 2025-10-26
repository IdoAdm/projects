
import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import ValueProposition from './components/ValueProposition';
import CTA from './components/CTA';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <Features />
        <ValueProposition />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default App;
