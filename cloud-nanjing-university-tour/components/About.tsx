import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Cpu, Globe, Rocket, Shield } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section id="about" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Blur */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full absolute inset-0 bg-cover bg-center filter blur-[3px]"
          style={{ backgroundImage: `url(/301.jpg)` }}
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 text-white">
              关于 <span className="text-purple-300">云上南雍</span>
            </h2>
            <div className="space-y-6 text-gray-200 text-lg leading-relaxed font-light mb-12">
              <p>
                “云上南雍”不仅仅是一个地图导航，它是南京大学精神风貌的数字化延伸。我们整合了高精度倾斜摄影、WebGL实时渲染与大语言模型技术，将鼓楼校区的古朴典雅与仙林校区的现代宏大完美复刻于云端。
              </p>
              <p>
                在这里，每一块青砖都承载着百年的记忆，每一条道路都通往未来的可能。无论您是远道而来的访客、即将入学的学子，还是心系母校的校友，都能通过本系统跨越视空限制，身临其境地感受“诚朴雄伟，励学敦行”的南大校训，开启一场属于您的数字化百年校庆之旅。
              </p>
            </div>

            {/* Core Tech Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {[
                { icon: Globe, label: "WebGL 渲染", desc: "极致 3D 视觉体验" },
                { icon: Cpu, label: "AI 交互", desc: "智慧校园数字大脑" },
                { icon: Rocket, label: "5G 接入", desc: "极速漫游低延迟" },
                { icon: Shield, label: "生活助手", desc: "帮助你在校园立足" }
              ].map((tech, i) => (
                <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md hover:bg-white/10 transition-colors">
                  <tech.icon className="w-8 h-8 text-purple-300 mb-3 mx-auto" />
                  <h4 className="text-white font-bold text-sm mb-1">{tech.label}</h4>
                  <p className="text-white/40 text-xs">{tech.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Integrated Footer Content with larger margin */}
        <div className="mt-48 border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center text-white/50">
          <div className="flex flex-col md:flex-row gap-8 items-center mb-8 md:mb-0">
            <span className="font-serif text-lg text-white/80">云上南雍</span>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">联系我们</a>
              <a href="#" className="hover:text-white transition-colors">使用帮助</a>
              <a href="#" className="hover:text-white transition-colors">反馈建议</a>
            </div>
          </div>
          <p className="text-xs">
            © {new Date().getFullYear()} 南京大学. All Rights Reserved.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;