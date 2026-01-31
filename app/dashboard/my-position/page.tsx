'use client';

import MyPositionsView from "@/app/components/core/MyPositionsView";

export default function MyPositionPage() {
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-heading text-[#3674B5]">My Position</h1>
        <MyPositionsView />
    </div>
  );
}
