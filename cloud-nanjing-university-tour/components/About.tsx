import React from 'react';
import { motion } from 'framer-motion';
import { Accessibility, BrainCircuit, Camera, HeartHandshake, RefreshCw, Waypoints } from 'lucide-react';

const values = [
  {
    icon: Accessibility,
    title: '为行动不便者而设计',
    text: '路线不只比较距离，还把台阶、坡度、宽度、路面和实时障碍纳入判断。',
  },
  {
    icon: RefreshCw,
    title: '道路状态持续更新',
    text: '用户上报与 GO Ultra 出行影像不断补充现场信息，降低“地图已过期”的风险。',
  },
  {
    icon: HeartHandshake,
    title: '把真实出行变成公共贡献',
    text: '一次观察可以帮助下一位使用者更确定地出门，让无障碍信息越用越准确。',
  },
];

const About: React.FC = () => (
  <section id="about" className="bg-[#eef3f4] py-24 lg:py-32">
    <div className="mx-auto max-w-[1320px] px-5 lg:px-8">
      <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <motion.div initial={false} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-[0.14em] text-[#1f6f5f]">WHY ACCESSMEMORY</p>
          <h2 className="mt-4 text-4xl font-bold leading-tight text-[#14202b] lg:text-5xl">让“确定地出门”成为日常</h2>
          <p className="mt-7 text-base leading-8 text-[#60717c] lg:text-lg">
            对多数人来说，几百米只是一段路；对轮椅使用者来说，一处没有坡道的台阶、一辆占住入口的汽车、一次临时施工，都可能意味着原路返回。
          </p>
          <p className="mt-5 text-base leading-8 text-[#60717c] lg:text-lg">
            路忆不试图先做一张庞大的城市地图，而是从南京栖霞的真实园区开始，把“看见现场、理解路况、规划路线、持续更新”这个闭环完整跑通。
          </p>

          <blockquote className="mt-10 border-l-4 border-[#ffd100] pl-6 text-2xl font-bold leading-relaxed text-[#14202b] lg:text-3xl">
            每一次真实出行，<br />都在帮助下一次出行。
          </blockquote>
        </motion.div>

        <div className="border-t border-[#c8d4d7]">
          {values.map((item, index) => (
            <motion.article
              key={item.title}
              initial={false}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="grid gap-5 border-b border-[#c8d4d7] py-7 sm:grid-cols-[56px_1fr]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-[7px] bg-white text-[#2f6bff] shadow-sm">
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div><h3 className="text-xl font-bold text-[#14202b]">{item.title}</h3><p className="mt-2 text-sm leading-7 text-[#60717c]">{item.text}</p></div>
            </motion.article>
          ))}
        </div>
      </div>

      <div className="mt-20 grid overflow-hidden rounded-[8px] border border-[#c8d4d7] bg-white md:grid-cols-3">
        <div className="p-7 md:border-r md:border-[#d9e2e4]">
          <Camera className="h-6 w-6 text-[#2f6bff]" aria-hidden="true" />
          <p className="mt-5 text-xs font-bold tracking-[0.12em] text-[#60717c]">REAL SPACE</p>
          <p className="mt-2 font-bold">Insta360 X5 + AHOLO</p>
        </div>
        <div className="border-t border-[#d9e2e4] p-7 md:border-r md:border-t-0">
          <BrainCircuit className="h-6 w-6 text-[#1f8a63]" aria-hidden="true" />
          <p className="mt-5 text-xs font-bold tracking-[0.12em] text-[#60717c]">ROAD AWARENESS</p>
          <p className="mt-2 font-bold">多模态 AI 路况理解</p>
        </div>
        <div className="border-t border-[#d9e2e4] p-7 md:border-t-0">
          <Waypoints className="h-6 w-6 text-[#d38a00]" aria-hidden="true" />
          <p className="mt-5 text-xs font-bold tracking-[0.12em] text-[#60717c]">ACCESSIBLE ROUTING</p>
          <p className="mt-2 font-bold">状态约束的动态路线规划</p>
        </div>
      </div>
    </div>
  </section>
);

export default About;
