import React, { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, MapPin, Zap, ExternalLink, Sparkles, Bot, Landmark } from 'lucide-react';

// Restore Glowing Particles for Dark Background - Tinted Gold
const Particle: React.FC<{ index: number }> = ({ index }) => {
  const randomX = useMemo(() => Math.random() * 100, []);
  const randomY = useMemo(() => Math.random() * 100, []);
  const duration = useMemo(() => 10 + Math.random() * 20, []);
  const delay = useMemo(() => Math.random() * 5, []);
  const size = useMemo(() => 2 + Math.random() * 3, []);

  return (
    <motion.div
      className="absolute rounded-full bg-[#D4AF37]" // Gold particles
      style={{
        left: `${randomX}%`,
        top: `${randomY}%`,
        width: size,
        height: size,
        opacity: 0.3,
        boxShadow: `0 0 ${size * 2}px #D4AF37`,
      }}
      animate={{
        y: [0, -100, 0],
        opacity: [0.2, 0.6, 0.2],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
    />
  );
};

// Shooting Star Component - Gold
const ShootingStar: React.FC = () => {
  return (
    <motion.div
      className="absolute h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
      initial={{ x: -100, y: -100, opacity: 0 }}
      animate={{ x: 800, y: 800, opacity: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
      style={{ width: '150px', transform: 'rotate(45deg)' }}
    />
  )
}


const Hero: React.FC = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Generate particles
  const particles = Array.from({ length: 30 }).map((_, i) => <Particle key={i} index={i} />);

  return (
    <section
      ref={ref}
      className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-[#2e0e2e]" // Deep purple base
    >
      {/* Background - Official NJU Colors Atmosphere */}
      <div className="absolute inset-0 z-0">
        {/* Main Background Image - Darkened */}
        <motion.div
          style={{ y, scale: 1.1 }}
          className="absolute inset-0 bg-[url('/300.jpg')] bg-cover bg-center"
        >
          <div className="absolute inset-0 bg-black/30"></div>
        </motion.div>

        {/* Animated Gradient Orbs - Purple & Gold */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#63065E] blur-[150px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#D4AF37] blur-[150px] opacity-20 animate-pulse delay-1000"></div>

        {/* Particles */}
        <div className="absolute inset-0 z-10">{particles}</div>
        <ShootingStar />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-20 text-center px-4 max-w-5xl mx-auto space-y-8"
      >
        {/* Motto */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: -20 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex items-center justify-center gap-4 text-[#D4AF37] font-serif font-bold tracking-[0.5em] text-lg md:text-xl"
        >
          <span className="h-[1px] w-12 bg-[#D4AF37]/70"></span>
          <span>诚朴雄伟 励学敦行</span>
          <span className="h-[1px] w-12 bg-[#D4AF37]/70"></span>
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, type: "spring" }}
        >
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/80 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] tracking-wide mb-2">
            云上南雍
          </h1>

        </motion.div>

        {/* Main Action - Unified Style with Dock */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12"
        >
          <button
            onClick={() => window.open('http://127.0.0.1:8080', '_blank')}
            className="px-12 py-5 bg-[#63065E]/30 backdrop-blur-xl hover:bg-[#63065E]/50 text-white rounded-full font-bold text-xl transition-all shadow-[0_0_30px_rgba(99,6,94,0.2)] hover:shadow-[0_0_40px_rgba(99,6,94,0.4)] flex items-center gap-3 border border-white/10 group"
          >
            <Sparkles className="w-6 h-6 group-hover:animate-pulse" /> 开启漫游
          </button>
        </motion.div>


      </motion.div>

      {/* Scroll Hint */}
      <div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 cursor-pointer"
        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-white/80 flex flex-col items-center gap-2 text-center"
        >
          <span className="text-xs uppercase tracking-widest font-medium whitespace-nowrap">Scroll to Explore Core Modules</span>
          <ArrowDown className="w-6 h-6" />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;