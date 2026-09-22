import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Camera,
  CircleCheck,
  Clock3,
  Construction,
  Cuboid,
  ExternalLink,
  MapPin,
  Route,
  ScanSearch,
  ShieldAlert,
  UploadCloud,
} from 'lucide-react';
import { sceneUrl } from '../config';

const workflow = [
  {
    icon: Camera,
    index: '01',
    title: 'X5 全景采集',
    text: '一次走拍记录道路、入口、坡道与通道细节，让真实空间成为判断依据。',
  },
  {
    icon: Cuboid,
    index: '02',
    title: 'AHOLO 三维重建',
    text: '将园区生成可旋转、缩放、平移的高斯泼溅场景，出发前先看清现场。',
  },
  {
    icon: ScanSearch,
    index: '03',
    title: 'AI 路况识别',
    text: '从上报图片与出行视频中识别施工、占道、破损、台阶和过窄通道。',
  },
  {
    icon: Route,
    index: '04',
    title: '动态路线规划',
    text: '绕开 BLOCKED 路段，提高 CAUTION 路段代价，规划此刻真正能走的路线。',
  },
];

const scenes = [
  {
    id: 'entrance',
    title: '园区入口与景观步道',
    image: '/accessmemory-qixia-scene.jpg',
    meta: '入口 · 景观步道 · 连续坡度',
  },
  {
    id: 'corridor',
    title: '新中式酒店走廊',
    image: '/accessmemory-corridor.jpg',
    meta: '室内外连接 · 通道宽度 · 转弯空间',
  },
  {
    id: 'lakeside',
    title: '湖畔入口与园林环路',
    image: '/accessmemory-lakeside.jpg',
    meta: '环路 · 园林入口 · 临水路段',
  },
];

const RouteDemo: React.FC = () => {
  const [blocked, setBlocked] = useState(false);

  return (
    <div className="overflow-hidden rounded-[8px] border border-[#ccd8dc] bg-white shadow-[0_18px_60px_rgba(22,44,56,0.10)]">
      <div className="flex flex-col gap-4 border-b border-[#dce5e7] px-5 py-4 md:flex-row md:items-center md:justify-between lg:px-7">
        <div>
          <p className="text-xs font-bold tracking-[0.12em] text-[#60717c]">LIVE ROUTE SIMULATION</p>
          <h3 className="mt-1 text-lg font-bold text-[#14202b]">南京 · 栖霞酒店园区</h3>
        </div>
        <div className="inline-flex self-start rounded-[7px] bg-[#edf2f3] p-1" role="group" aria-label="切换道路状态">
          <button
            type="button"
            onClick={() => setBlocked(false)}
            className={`min-h-10 rounded-[6px] px-4 text-sm font-bold transition-colors ${!blocked ? 'bg-white text-[#1f6f5f] shadow-sm' : 'text-[#60717c]'}`}
            aria-pressed={!blocked}
          >
            初始路况
          </button>
          <button
            type="button"
            onClick={() => setBlocked(true)}
            className={`min-h-10 rounded-[6px] px-4 text-sm font-bold transition-colors ${blocked ? 'bg-[#d94343] text-white shadow-sm' : 'text-[#60717c]'}`}
            aria-pressed={blocked}
          >
            AI 检测施工
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1.45fr)_minmax(310px,0.55fr)]">
        <div className="relative min-h-[460px] overflow-hidden bg-[#eaf0ec] p-4 sm:p-7">
          <div className="absolute inset-0 opacity-60" aria-hidden="true" style={{ backgroundImage: 'linear-gradient(#cfdad4 1px, transparent 1px), linear-gradient(90deg, #cfdad4 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
          <svg className="relative h-full min-h-[410px] w-full" viewBox="0 0 720 440" role="img" aria-label={blocked ? '道路 B 施工后，路线改走道路 C 和道路 D' : '初始路线经过道路 A 和道路 B'}>
            <path d="M70 345 C150 345 176 300 230 260 C286 218 330 220 380 190 C454 145 520 150 650 82" fill="none" stroke="#bbc9c0" strokeWidth="46" strokeLinecap="round" />
            <path d="M230 260 C300 310 390 350 520 330 C584 320 620 250 650 82" fill="none" stroke="#c7d3cc" strokeWidth="40" strokeLinecap="round" />
            <path d="M70 345 C150 345 176 300 230 260" fill="none" stroke="#2f6bff" strokeWidth="10" strokeLinecap="round" />
            {!blocked ? (
              <motion.path
                key="open-route"
                d="M230 260 C286 218 330 220 380 190 C454 145 520 150 650 82"
                fill="none"
                stroke="#2f6bff"
                strokeWidth="10"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8 }}
              />
            ) : (
              <motion.path
                key="detour-route"
                d="M230 260 C300 310 390 350 520 330 C584 320 620 250 650 82"
                fill="none"
                stroke="#2f6bff"
                strokeWidth="10"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8 }}
              />
            )}
            <path d="M230 260 C286 218 330 220 380 190 C454 145 520 150 650 82" fill="none" stroke={blocked ? '#d94343' : '#2f6bff'} strokeWidth={blocked ? 7 : 0} strokeDasharray="14 12" strokeLinecap="round" opacity={blocked ? 1 : 0} />

            <g fontFamily="Noto Sans SC, sans-serif" fontWeight="700" fontSize="14">
              <circle cx="70" cy="345" r="18" fill="#1f6f5f" /><text x="70" y="350" textAnchor="middle" fill="white">起</text>
              <circle cx="230" cy="260" r="15" fill="white" stroke="#2f6bff" strokeWidth="5" /><text x="230" y="230" textAnchor="middle" fill="#38505c">道路 A</text>
              <circle cx="380" cy="190" r="15" fill={blocked ? '#d94343' : 'white'} stroke={blocked ? '#d94343' : '#2f6bff'} strokeWidth="5" /><text x="380" y="160" textAnchor="middle" fill="#38505c">道路 B</text>
              <circle cx="520" cy="330" r="15" fill={blocked ? 'white' : '#d5ded9'} stroke={blocked ? '#2f6bff' : '#aab8b0'} strokeWidth="5" /><text x="520" y="375" textAnchor="middle" fill="#38505c">道路 C / D</text>
              <circle cx="650" cy="82" r="18" fill="#17202a" /><text x="650" y="87" textAnchor="middle" fill="white">终</text>
            </g>
          </svg>

          <div className="absolute left-5 top-5 flex items-center gap-2 rounded-[6px] border border-white bg-white/95 px-3 py-2 text-xs font-bold text-[#38505c] shadow-sm sm:left-7 sm:top-7">
            <MapPin className="h-4 w-4 text-[#1f6f5f]" aria-hidden="true" />
            酒店入口 → 主会场
          </div>
          {blocked && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="absolute right-5 top-5 rounded-[6px] bg-[#d94343] px-3 py-2 text-xs font-bold text-white shadow-sm sm:right-7 sm:top-7">
              道路 B · BLOCKED
            </motion.div>
          )}
        </div>

        <aside className="border-t border-[#dce5e7] bg-[#fbfcfc] p-5 lg:border-l lg:border-t-0 lg:p-7" aria-live="polite">
          <div className={`inline-flex items-center gap-2 rounded-[6px] px-3 py-2 text-xs font-bold ${blocked ? 'bg-[#fceaea] text-[#b82929]' : 'bg-[#e4f6ed] text-[#176348]'}`}>
            {blocked ? <Construction className="h-4 w-4" aria-hidden="true" /> : <CircleCheck className="h-4 w-4" aria-hidden="true" />}
            {blocked ? 'AI 已发现施工围挡' : '当前道路均可通行'}
          </div>

          <p className="mt-7 text-xs font-bold tracking-[0.12em] text-[#60717c]">推荐无障碍路线</p>
          <p className="mt-2 text-2xl font-bold text-[#14202b]">{blocked ? '520 m · 预计 8 分钟' : '400 m · 预计 6 分钟'}</p>
          <p className="mt-3 text-sm leading-6 text-[#60717c]">
            {blocked ? '原路线受道路 B 施工影响，系统已自动切换到湖边环路。' : '入口经道路 A、道路 B 直达主会场，全程无台阶。'}
          </p>

          <div className="mt-7 space-y-4 border-y border-[#dce5e7] py-6 text-sm">
            <div className="flex items-center gap-3"><CircleCheck className="h-5 w-5 text-[#1f8a63]" aria-hidden="true" /><span>全程无台阶</span></div>
            <div className="flex items-center gap-3"><CircleCheck className="h-5 w-5 text-[#1f8a63]" aria-hidden="true" /><span>{blocked ? '已避开施工路段' : '通过连续坡道'}</span></div>
            <div className="flex items-center gap-3"><Clock3 className="h-5 w-5 text-[#2f6bff]" aria-hidden="true" /><span>路况更新于刚刚</span></div>
          </div>

          {blocked && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 rounded-[7px] border border-[#efcaca] bg-[#fff7f7] p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#d94343]" aria-hidden="true" />
                <div><strong className="text-sm text-[#8d2424]">HIGH 风险</strong><p className="mt-1 text-xs leading-5 text-[#8d4b4b]">施工围挡占据主要轮椅通行区域，置信度 96%。</p></div>
              </div>
            </motion.div>
          )}
        </aside>
      </div>
    </div>
  );
};

const Features: React.FC = () => (
  <>
    <section id="workflow" className="bg-[#f4f7f8] py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-5 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-[#1f6f5f]">PRODUCT LOOP</p>
            <h2 className="mt-4 max-w-[560px] text-4xl font-bold leading-tight text-[#14202b] lg:text-5xl">从一次拍摄，到一张会持续更新的地图</h2>
          </div>
          <p className="max-w-[680px] text-base leading-8 text-[#60717c] lg:justify-self-end lg:text-lg">普通地图记录道路是否存在，路忆记录道路此刻是否可通行。每一次用户上报与真实出行影像，都能让下一次路线规划更可靠。</p>
        </div>

        <div className="mt-14 grid border-y border-[#cad6d9] md:grid-cols-2 xl:grid-cols-4">
          {workflow.map((item, index) => (
            <motion.article
              key={item.title}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: index * 0.08 }}
              className="relative border-b border-[#cad6d9] px-1 py-8 md:border-r md:px-7 xl:border-b-0 first:pl-0 last:border-r-0"
            >
              <div className="flex items-center justify-between">
                <item.icon className="h-7 w-7 text-[#2f6bff]" aria-hidden="true" />
                <span className="text-xs font-bold text-[#93a3aa]">{item.index}</span>
              </div>
              <h3 className="mt-8 text-xl font-bold">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#60717c]">{item.text}</p>
              {index < workflow.length - 1 && <ArrowRight className="absolute -right-3 top-[42px] z-10 hidden h-5 w-5 bg-[#f4f7f8] text-[#93a3aa] xl:block" aria-hidden="true" />}
            </motion.article>
          ))}
        </div>
      </div>
    </section>

    <section id="demo" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-5 lg:px-8">
        <div className="mb-12 max-w-[760px]">
          <p className="text-xs font-bold tracking-[0.14em] text-[#2f6bff]">ACCESSIBLE ROUTING</p>
          <h2 className="mt-4 text-4xl font-bold leading-tight lg:text-5xl">距离最短，不等于最推荐</h2>
          <p className="mt-5 text-base leading-8 text-[#60717c] lg:text-lg">点击“AI 检测施工”，查看道路 B 从 OPEN 变为 BLOCKED 后，路线如何立刻绕开施工路段。</p>
        </div>
        <RouteDemo />
      </div>
    </section>

    <section id="scenes" className="bg-[#0a1722] py-24 text-white lg:py-32">
      <div className="mx-auto max-w-[1320px] px-5 lg:px-8">
        <div className="flex flex-col gap-6 border-b border-white/15 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-[#79dcb2]">NANJING · QIXIA</p>
            <h2 className="mt-4 text-4xl font-bold leading-tight lg:text-5xl">用真实空间，而不是抽象线条做判断</h2>
          </div>
          <p className="max-w-[520px] text-sm leading-7 text-white/60">以下画面直接由本项目的 AHOLO 高斯泼溅模型离线投影生成。完整 3D 页面支持场景切换、旋转、缩放、平移与全屏。</p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {scenes.map((scene, index) => (
            <motion.a
              key={scene.id}
              href={sceneUrl(scene.id)}
              target="_blank"
              rel="noreferrer"
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group overflow-hidden rounded-[8px] border border-white/15 bg-[#0f202d] transition-colors hover:border-[#79dcb2]/70"
            >
              <div className="aspect-[16/10] overflow-hidden bg-[#07111f]">
                <img src={scene.image} alt={`${scene.title}点云预览`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div><h3 className="text-lg font-bold">{scene.title}</h3><p className="mt-2 text-sm leading-6 text-white/50">{scene.meta}</p></div>
                  <ExternalLink className="h-5 w-5 shrink-0 text-[#79dcb2]" aria-hidden="true" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-white/15 pt-8 md:flex-row md:items-center">
          <div className="flex items-start gap-3"><UploadCloud className="mt-1 h-6 w-6 text-[#ffd100]" aria-hidden="true" /><div><strong className="block">真实接口优先，Mock 保证现场稳定</strong><span className="mt-1 block text-sm text-white/60">AHOLO 重建、GO Ultra 导入与 VLM 分析均保留明确替换点。</span></div></div>
          <a href={sceneUrl('entrance')} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-[7px] bg-white px-5 text-sm font-bold text-[#14202b] hover:bg-[#edf2f3]">进入 3D 场景 <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  </>
);

export default Features;
