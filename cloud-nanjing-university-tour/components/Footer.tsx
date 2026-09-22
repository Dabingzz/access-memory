import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-100 border-t border-slate-200 py-12">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-6 md:mb-0 text-center md:text-left">
            <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">云上南雍</h3>
            <p className="text-slate-500 text-sm">Nanjing University Cloud Campus Tour System</p>
        </div>

        <div className="flex flex-col items-center md:items-end">
             <div className="flex space-x-6 mb-4">
                 <a href="#" className="text-slate-500 hover:text-purple-700 transition-colors">联系我们</a>
                 <a href="#" className="text-slate-500 hover:text-purple-700 transition-colors">使用帮助</a>
                 <a href="#" className="text-slate-500 hover:text-purple-700 transition-colors">反馈建议</a>
             </div>
             <p className="text-slate-400 text-xs">
                © {new Date().getFullYear()} 南京大学. All Rights Reserved.
             </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;