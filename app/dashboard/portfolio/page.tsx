'use client';

import PortfolioView from "@/app/components/core/PortfolioView";

export default function PortfolioPage() {
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-heading text-[#3674B5]">Portfolio</h1>
        <PortfolioView />
    </div>
  );
}
