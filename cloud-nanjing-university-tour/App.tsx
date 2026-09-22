import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import About from './components/About';
import Footer from './components/Footer';

const App: React.FC = () => (
  <div className="min-h-screen bg-[#f4f7f8] text-[#14202b] selection:bg-[#1f6f5f]/20">
    <Navbar />
    <main>
      <Hero />
      <Features />
      <About />
    </main>
    <Footer />
  </div>
);

export default App;
