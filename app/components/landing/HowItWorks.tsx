"use client";

import { motion } from "framer-motion";

const steps = [
  {
    id: 1,
    title: "Scout Creators",
    desc: "Analyze real-time Farcaster engagement data (Casts, Likes, Replies).",
    icon: "🔍"
  },
  {
    id: 2,
    title: "Build Your Deck",
    desc: "Collect NFT Cards of your favorite creators on Base.",
    icon: "🃏"
  },
  {
    id: 3,
    title: "Predict & Earn",
    desc: "Trade options via Thetanuts based on performance predictions.",
    icon: "📈"
  }
];

export default function HowItWorks() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto px-6">
      {steps.map((step, i) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.2, duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-[#D1F8EF] border border-[#3674B5] p-8 rounded-xl relative shadow-[8px_8px_0px_0px_#3674B5] hover:translate-y-[-5px] hover:shadow-[12px_12px_0px_0px_#3674B5] transition-all"
        >
          <div className="absolute -top-6 -left-6 bg-[#578FCA] text-white w-12 h-12 flex items-center justify-center rounded-full font-heading text-xl border-2 border-[#3674B5]">
            {step.id}
          </div>
          <div className="text-4xl mb-4">{step.icon}</div>
          <h3 className="text-2xl font-heading text-[#3674B5] mb-2">{step.title}</h3>
          <p className="font-body text-[#3674B5]/80 leading-relaxed">{step.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}
