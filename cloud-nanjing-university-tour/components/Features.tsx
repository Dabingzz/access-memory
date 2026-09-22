import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Map, Glasses, Navigation, Bot, Landmark, Sparkles, MoveRight, Layers, Compass, MessageCircle } from 'lucide-react';

// --- Types ---
type Feature = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  details: string[];
  icon: React.ElementType;
  color: string;
  gradient: string;
  bgImage: string;
};

// --- Data ---
const features: Feature[] = [
  {
    id: "map",
    title: "鼓楼校区地图",
    subtitle: "Digital Twin Campus",
    description: "穿越百年时空，感受鼓楼校区的厚重与静谧。我们利用高精度无人机倾斜摄影与Web3D技术，将每一栋建筑、每一条道路、每一棵古树都完美复刻。",
    details: ["厘米级高精度模型", "实时光照渲染", "无缝缩放体验", "四季即时切换"],
    icon: Map,
    color: "text-purple-300",
    gradient: "from-[#63065E]/90 to-indigo-900/90",
    bgImage: "/300.jpg"
  },
  {
    id: "vr",
    title: "720度全景视角",
    subtitle: "Immersive VR Experience",
    description: "打破时空限制，无论身在何处，都能如同置身校园。支持VR头显模式，沉浸式漫游北大楼、大礼堂、校史馆等标志性地标。",
    details: ["8K超清全景", "VR头显支持", "重力感应漫游", "定点语音讲解"],
    icon: Glasses,
    color: "text-cyan-300",
    gradient: "from-blue-900/80 to-cyan-900/80",
    bgImage: "/310.png"
  },
  {
    id: "nav",
    title: "智能路径规划",
    subtitle: "Smart Navigation",
    description: "不仅是地图，更是您的私人向导。基于多层路网拓扑分析，为您提供从宿舍到教室、从食堂到图书馆的最优路线，支持步行、骑行与校车方案。",
    details: ["跨校区导航", "实时路况分析", "AR实景指引", "无障碍路径优先"],
    icon: Navigation,
    color: "text-amber-300",
    gradient: "from-amber-900/80 to-orange-900/80",
    bgImage: "/302.jpg"
  },
  {
    id: "ai",
    title: "AI校园生活助手",
    subtitle: "AI Personal Assistant",
    description: "接入大语言模型，懂您所想，答您所问。无论是查询空闲教室、获取食堂菜单，还是了解讲座信息，只需简单对话，即刻获取。",
    details: ["自然语言交互", "个性化日程提醒", "实时生活服务", "多模态感知"],
    icon: Bot,
    color: "text-emerald-300",
    gradient: "from-emerald-900/80 to-teal-900/80",
    bgImage: "/304.png"
  },
  {
    id: "building",
    title: "建筑物介绍",
    subtitle: "Architectural Archives",
    description: "每一栋建筑都是一部凝固的历史。点击建筑模型，即可唤起其背后的历史档案、设计理念与人文故事，让参观变得更有深度。",
    details: ["图文影音档案", "建筑结构剖析", "历史变迁时间轴", "校友回忆录"],
    icon: Landmark,
    color: "text-rose-300",
    gradient: "from-rose-900/80 to-pink-900/80",
    bgImage: "/305.png"
  }
];

// --- Sub-components ---

// Abstract Visual Representation for each module
const FeatureVisual: React.FC<{ feature: Feature }> = ({ feature }) => {
  switch (feature.id) {
    case 'map':
      return (
        <div className="relative w-full h-[400px] bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-white/20">
          {/* Floating Map Layers Effect */}
          {['/300.jpg', '/301.jpg', '/302.jpg'].map((img, index) => {
            const i = index + 1;
            return (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
                className={`absolute inset-x-10 h-[200px] rounded-xl border border-white/20 bg-cover bg-center shadow-lg flex items-center justify-center overflow-hidden`}
                style={{
                  top: `${i * 60 + 20}px`,
                  scale: 1 - i * 0.05,
                  zIndex: 3 - i,
                  backgroundImage: `url(${img})`
                }}
              >
                <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors duration-500"></div>
              </motion.div>
            )
          })}
          <div className="absolute top-10 right-10 p-3 bg-white/20 backdrop-blur-md rounded-full shadow-lg border border-white/30 animate-bounce z-10">
            <Map className="w-8 h-8 text-white" />
          </div>
        </div>
      );
    case 'vr':
      return (
        <div className="relative w-full h-[400px] bg-black/40 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-white/20 group">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url(/306.png)` }}
          ></div>
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Glasses className="w-8 h-8 text-white drop-shadow-md" />
            </div>
          </div>
        </div>
      );
    case 'nav':
      return (
        <div className="relative w-full h-[400px] bg-slate-900/60 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex items-center justify-center">
          {/* Path Path */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
            <motion.path
              d="M 50 350 Q 200 350 200 200 T 350 50"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="4"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.path
              d="M 50 350 Q 200 350 200 200 T 350 50"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="12"
              strokeOpacity="0.2"
            />
          </svg>

          <motion.div
            animate={{ offsetDistance: "100%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute p-2 bg-amber-500 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.8)]"
            style={{ offsetPath: "path('M 50 350 Q 200 350 200 200 T 350 50')" }}
          >
            <Navigation className="w-5 h-5 text-white" />
          </motion.div>

          {/* Waypoints */}
          <div className="absolute bottom-10 left-10 p-2 bg-black/40 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
              <span className="text-xs text-white/80">Start</span>
            </div>
          </div>
          <div className="absolute top-10 right-10 p-2 bg-black/40 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
              <span className="text-xs text-white/80">End</span>
            </div>
          </div>
        </div>
      );
    case 'ai':
      return (
        <div className="relative w-full h-[400px] bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col items-center justify-center p-8">
          {/* Chat Bubbles */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="self-start bg-black/40 p-4 rounded-2xl rounded-tl-none mb-4 max-w-[80%] border border-white/10"
          >
            <p className="text-emerald-400 text-xs mb-1 uppercase tracking-wider">用户</p>
            <p className="text-white text-sm">请问冯桂焕老师办公室在哪？</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-4"
          >
            <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <Sparkles className="w-6 h-6 text-emerald-400 animate-spin-slow" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            className="self-end bg-emerald-900/40 p-4 rounded-2xl rounded-tr-none max-w-[80%] border border-emerald-500/30"
          >
            <p className="text-emerald-400 text-xs mb-1 uppercase tracking-wider">AI助手</p>
            <p className="text-white text-sm">在费彝民楼B座907办公室。</p>
          </motion.div>
        </div>
      );
    case 'building':
      return (
        <div className="relative w-full h-[400px] bg-black/40 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-white/20 group">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url(/303.jpg)` }}
          ></div>
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Landmark className="w-8 h-8 text-white drop-shadow-md" />
            </div>
          </div>
        </div>
      );
    default:
      return <div className="w-full h-64 bg-slate-100 rounded-xl"></div>;
  }
}


const FeatureSection: React.FC<{ feature: Feature; index: number }> = ({ feature, index }) => {
  const isEven = index % 2 === 0;
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  // Parallax effect for the background image
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacityProgress = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} id={feature.id} className="min-h-screen flex items-center justify-center py-20 relative overflow-hidden">

      {/* 1. Background Image with Blur & Parallax */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          style={{ y: bgY, scale: 1.1 }}
          className="absolute inset-0 bg-cover bg-center"
        >
          <div
            className="w-full h-full absolute inset-0 bg-cover bg-center filter blur-[3px]"
            style={{ backgroundImage: `url(${feature.bgImage})` }}
          />
        </motion.div>
        {/* 2. Neutral Dark Overlay for Text Readability (No Color Tint) */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <motion.div
        style={{ opacity: opacityProgress, y: contentY }}
        className="container mx-auto px-6 relative z-10"
      >
        <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-24`}>

          {/* Text Content */}
          <div className="flex-1 space-y-8">
            <div className="space-y-2">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`text-sm font-bold tracking-[0.2em] uppercase ${feature.color} flex items-center gap-3`}
              >
                <span className="w-12 h-[2px] bg-current"></span>
                {feature.subtitle}
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-7xl font-serif font-bold text-white leading-tight drop-shadow-2xl"
              >
                {feature.title}
              </motion.h2>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-xl font-light"
            >
              {feature.description}
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-4">
              {feature.details.map((detail, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center space-x-3 text-gray-300"
                >
                  <div className={`w-2 h-2 rounded-full ${feature.color.replace('text-', 'bg-')} shadow-[0_0_10px_currentColor]`}></div>
                  <span className="text-sm font-medium tracking-wide">{detail}</span>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ x: 10 }}
              onClick={() => window.open('http://127.0.0.1:8080', '_blank')}
              className={`mt-6 group flex items-center gap-3 text-lg font-bold ${feature.color}`}
            >
              探索体验 <MoveRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
            </motion.button>
          </div>

          {/* Visual Content */}
          <div className="flex-1 w-full max-w-xl">
            <FeatureVisual feature={feature} />
          </div>

        </div>
      </motion.div>
    </section>
  );
};

const Features: React.FC = () => {
  return (
    <div id="features" className="bg-neutral-900 relative">
      {features.map((feature, index) => (
        <FeatureSection key={feature.id} feature={feature} index={index} />
      ))}
    </div>
  );
};

export default Features;