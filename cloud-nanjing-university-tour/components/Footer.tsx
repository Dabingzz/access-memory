import React from 'react';
import { Accessibility, ExternalLink } from 'lucide-react';
import { ACCESS_MEMORY_3D_URL } from '../config';

const Footer: React.FC = () => (
  <footer className="bg-[#07111f] text-white">
    <div className="mx-auto max-w-[1320px] px-5 py-14 lg:px-8">
      <div className="flex flex-col gap-10 border-b border-white/15 pb-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-[520px]">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[7px] bg-[#2f6bff]"><Accessibility className="h-6 w-6" aria-hidden="true" /></span>
            <div><strong className="block text-lg">路忆 AccessMemory</strong><span className="text-xs text-white/50">AI 动态无障碍地图</span></div>
          </div>
          <p className="mt-5 text-sm leading-7 text-white/60">用影像看见真实空间，用 AI 判断道路能不能走，用地图规划真正可通行的路线。</p>
        </div>

        <nav aria-label="页脚导航" className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm text-white/70 sm:grid-cols-4">
          <a href="#workflow" className="py-2 hover:text-white">产品闭环</a>
          <a href="#demo" className="py-2 hover:text-white">路线演示</a>
          <a href="#scenes" className="py-2 hover:text-white">栖霞场景</a>
          <a href="#about" className="py-2 hover:text-white">公益愿景</a>
        </nav>

        <a href={ACCESS_MEMORY_3D_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[7px] bg-[#ffd100] px-5 text-sm font-bold text-[#17202a] hover:bg-[#ffe04d]">
          打开 3D 空间 <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      <div className="flex flex-col gap-3 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 AccessMemory 路忆团队 · Insta360 黑客松公益赛道参赛作品</p>
        <p>试点场景：南京 · 栖霞 · 酒店园区</p>
      </div>
    </div>
  </footer>
);

export default Footer;
