import React from 'react';
import { ArrowDown, ArrowRight, CircleCheck, ExternalLink, MapPin, Radio } from 'lucide-react';
import { motion } from 'framer-motion';
import { ACCESS_MEMORY_3D_URL } from '../config';

const Hero: React.FC = () => (
  <section className="relative flex min-h-[760px] items-end overflow-hidden bg-[#07111f] pt-[72px] lg:min-h-[820px] lg:h-[94vh]">
    <img
      src="/accessmemory-qixia-scene.jpg"
      alt="由酒店园区高斯泼溅模型生成的栖霞景观步道点云"
      className="absolute inset-0 h-full w-full object-cover object-center"
    />
    <div className="absolute inset-0 bg-[#04101a]/62" aria-hidden="true" />
    <div className="absolute inset-y-0 left-0 w-[58%] bg-[#04101a]/45" aria-hidden="true" />

    <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 pb-8 pt-24 lg:px-8 lg:pb-10">
      <div className="max-w-[820px] pb-16 lg:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-7 flex flex-wrap items-center gap-3 text-xs font-bold tracking-[0.08em] text-white/80"
        >
          <span className="inline-flex items-center gap-2 rounded-[6px] border border-[#ffd100]/60 bg-[#ffd100]/10 px-3 py-2 text-[#ffe45c]">
            <Radio className="h-4 w-4" aria-hidden="true" />
            INSTA360 黑客松 · 公益赛道
          </span>
          <span className="inline-flex items-center gap-2 rounded-[6px] border border-white/20 bg-black/20 px-3 py-2">
            <MapPin className="h-4 w-4 text-[#58d29d]" aria-hidden="true" />
            首个实景样本 · 南京栖霞
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08 }}
          className="font-serif text-6xl font-bold leading-[0.95] text-white sm:text-7xl lg:text-[104px]"
        >
          路忆
          <span className="mt-4 block font-sans text-xl font-semibold tracking-[0.1em] text-[#79dcb2] sm:text-2xl lg:text-3xl">
            AccessMemory
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="mt-8 max-w-[760px] text-2xl font-semibold leading-tight text-white sm:text-3xl lg:text-4xl"
        >
          这条路，现在能走吗？
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.26 }}
          className="mt-5 max-w-[700px] text-base leading-8 text-white/70 sm:text-lg"
        >
          用 Insta360 X5 看见真实空间，用 AHOLO 重建园区，用 AI 判断施工、占道与坡道状态，
          为轮椅使用者和行动不便人群规划一条此刻真正可通行的路线。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.34 }}
          className="mt-9 flex flex-col gap-3 sm:flex-row"
        >
          <a
            href="#demo"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[7px] bg-[#ffd100] px-6 font-bold text-[#17202a] transition-colors hover:bg-[#ffe04d]"
          >
            看路线如何自动改道
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </a>
          <a
            href={ACCESS_MEMORY_3D_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[7px] border border-white/35 bg-black/20 px-6 font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
          >
            浏览栖霞 3D 空间
            <ExternalLink className="h-5 w-5" aria-hidden="true" />
          </a>
        </motion.div>
      </div>

      <div className="grid border-y border-white/20 bg-[#07111f]/45 backdrop-blur-md sm:grid-cols-3">
        <div className="flex items-center gap-3 px-4 py-4 sm:border-r sm:border-white/20 lg:px-6">
          <CircleCheck className="h-5 w-5 shrink-0 text-[#58d29d]" aria-hidden="true" />
          <div><strong className="block text-sm text-white">4 个真实重建场景</strong><span className="text-xs text-white/60">酒店入口、走廊、园林与湖畔</span></div>
        </div>
        <div className="flex items-center gap-3 border-t border-white/20 px-4 py-4 sm:border-r sm:border-t-0 sm:border-white/20 lg:px-6">
          <CircleCheck className="h-5 w-5 shrink-0 text-[#58d29d]" aria-hidden="true" />
          <div><strong className="block text-sm text-white">动态路况状态</strong><span className="text-xs text-white/60">OPEN · CAUTION · BLOCKED</span></div>
        </div>
        <div className="flex items-center gap-3 border-t border-white/20 px-4 py-4 sm:border-t-0 lg:px-6">
          <CircleCheck className="h-5 w-5 shrink-0 text-[#58d29d]" aria-hidden="true" />
          <div><strong className="block text-sm text-white">路线自动重规划</strong><span className="text-xs text-white/60">异常出现后避开不可通行路段</span></div>
        </div>
      </div>
    </div>

    <a href="#workflow" className="absolute bottom-3 right-5 z-20 hidden items-center gap-2 text-xs font-bold tracking-[0.12em] text-white/60 md:flex lg:right-8">
      PRODUCT LOOP <ArrowDown className="h-4 w-4" aria-hidden="true" />
    </a>
  </section>
);

export default Hero;
