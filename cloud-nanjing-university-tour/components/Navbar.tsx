import React, { useEffect, useState } from 'react';
import { Accessibility, ExternalLink, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ACCESS_MEMORY_3D_URL } from '../config';

const links = [
  { label: '产品闭环', href: '#workflow' },
  { label: '路线演示', href: '#demo' },
  { label: '栖霞场景', href: '#scenes' },
  { label: '关于路忆', href: '#about' },
];

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navClass = isScrolled
    ? 'bg-white/95 text-[#14202b] border-[#d9e1e4] shadow-sm'
    : 'bg-[#07111f]/45 text-white border-white/15';

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-colors ${navClass}`}>
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 lg:px-8">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex min-w-0 items-center gap-3 text-left"
          aria-label="返回页面顶部"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[7px] bg-[#2f6bff] text-white">
            <Accessibility className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block text-lg font-bold">路忆 AccessMemory</span>
            <span className={`block truncate text-[11px] ${isScrolled ? 'text-[#60717c]' : 'text-white/70'}`}>
              AI 动态无障碍地图
            </span>
          </span>
        </button>

        <div className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium opacity-75 transition-opacity hover:opacity-100">
              {link.label}
            </a>
          ))}
          <a
            href={ACCESS_MEMORY_3D_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-[7px] bg-[#ffd100] px-5 text-sm font-bold text-[#17202a] transition-colors hover:bg-[#ffe04d]"
          >
            打开 3D 空间
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="grid h-11 w-11 place-items-center lg:hidden"
          aria-label={isOpen ? '关闭导航菜单' : '打开导航菜单'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[#d9e1e4] bg-white text-[#14202b] lg:hidden"
          >
            <div className="space-y-1 px-5 py-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block min-h-11 rounded-[6px] px-3 py-3 text-sm font-medium hover:bg-[#eef3f4]"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={ACCESS_MEMORY_3D_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-[7px] bg-[#2f6bff] px-4 font-bold text-white"
              >
                打开 3D 空间
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
