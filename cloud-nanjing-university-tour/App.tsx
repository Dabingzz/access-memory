import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import About from './components/About';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  // Simple entry animation simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center flex-col">
        <div className="w-16 h-16 border-4 border-purple-800 border-t-purple-400 rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-serif text-purple-900 tracking-widest animate-pulse">云上南雍</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-purple-200 selection:text-purple-900">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <About />
      </main>
    </div>
  );
};

export default App;