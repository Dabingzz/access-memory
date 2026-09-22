import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Adjusted scroll threshold
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dynamic styles based on scroll state
  const navBgClass = isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 py-3 shadow-sm' : 'bg-transparent py-6';
  const textColorClass = isScrolled ? 'text-slate-700 hover:text-purple-700' : 'text-white/90 hover:text-white';
  const logoClass = isScrolled ? 'brightness-0 opacity-90' : 'brightness-0 invert opacity-100';
  const buttonClass = isScrolled
    ? 'border-purple-700 text-purple-800 hover:bg-purple-50'
    : 'border-white/50 text-white hover:bg-white/10 backdrop-blur-sm';
  const mobileMenuButtonClass = isScrolled ? 'text-slate-900' : 'text-white';

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${navBgClass}`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div
          className="flex items-center cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img
            src="https://www.nju.edu.cn/images/logo.png"
            alt="Nanjing University Logo"
            className={`h-10 md:h-12 w-auto transition-all duration-500 ${logoClass} group-hover:opacity-100`}
          />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-2 bg-transparent border rounded-full text-sm font-bold transition-all flex items-center space-x-2 ${buttonClass}`}
            onClick={() => window.open('http://127.0.0.1:8080', '_blank')}
          >
            <span>进入系统</span>
          </motion.button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={mobileMenuButtonClass}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="flex flex-col p-6 space-y-4">
              <button
                className="w-full py-3 border border-purple-700 text-purple-800 rounded-lg font-bold mt-4"
                onClick={() => window.open('http://127.0.0.1:8080', '_blank')}
              >
                进入系统
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;