'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Radio, CheckCircle, Store, Repeat } from 'lucide-react';
import CreatorFeedCard from './CreatorFeedCard';
import CoreMarketView from './CoreMarketView';
import CoreSwapView from './CoreSwapView';
import CoreInsightPanel from './CoreInsightPanel';

// Available Creators (Chat Heads)
const CONTACTS = [
  { fid: 616, name: 'Vitalik Buterin', username: 'vitalik.eth', pfp: 'https://i.imgur.com/309M76w.jpg' }, 
  { fid: 5650, name: 'Jesse Pollak', username: 'jessepollak', pfp: 'https://i.imgur.com/Q30x4s2.jpg' },
  { fid: 3, name: 'Dan Romero', username: 'dwr.eth', pfp: 'https://i.imgur.com/973059w.jpg' },
];

interface FeedResponse {
  feed: Record<string, any[]>;
  count: number;
}

type TabType = 'feed' | 'market' | 'swap';

export default function CoreModeView() {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  
  // --- Feed Logic State ---
  const [visionaries, setVisionaries] = useState(CONTACTS);
  const [selectedCreator, setSelectedCreator] = useState(CONTACTS[0]);
  const [data, setData] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFeed = async (fid: number) => {
    setLoading(true);
    setError('');
    setData(null); 
    try {
      const res = await fetch(`/api/core/feed?fid=${fid}`);
      if (!res.ok) throw new Error('Failed to fetch feed');
      const json = await res.json();
      setData(json);

      // Sync PFP & Name with Real Data if available
      const firstGroupKey = Object.keys(json.feed)[0];
      if (firstGroupKey && json.feed[firstGroupKey].length > 0) {
          const firstCast = json.feed[firstGroupKey][0];
          const realPfp = firstCast.author.pfp;
          const realName = firstCast.author.name;
          
          if (realPfp || realName) {
              // Update the specific visionary in the list
              setVisionaries(prev => prev.map(v => 
                  v.fid === fid ? { 
                      ...v, 
                      pfp: realPfp || v.pfp,
                      name: realName || v.name 
                  } : v
              ));
              
              // Also update selectedCreator if it matches (to reflect immediately)
              if (selectedCreator.fid === fid) {
                   setSelectedCreator(prev => ({ 
                       ...prev, 
                       pfp: realPfp || prev.pfp,
                       name: realName || prev.name
                   }));
              }
          }
      }

    } catch (err) {
      console.error(err);
      setError('Failed to load. Limit reached?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'feed' && selectedCreator) {
      fetchFeed(selectedCreator.fid);
    }
  }, [selectedCreator.fid, activeTab]); // Fixed dependency to .fid to prevent loop

  const TABS = [
    { id: 'feed', label: 'Feed Creator', icon: Radio },
    { id: 'market', label: 'Market', icon: Store },
    // { id: 'swap', label: 'Swap Token', icon: Repeat }, // Disabled for now
  ];

  // Dynamic Container Width logic
  const containerClass = activeTab === 'market' ? 'max-w-7xl' : 'max-w-3xl';

  return (
    <div className={`${containerClass} mx-auto space-y-6 transition-all duration-500`}>
      
      {/* Tab Navigation (Blue Box) */}
      <div className={`bg-[#EBFDFF] border border-[#A1E3F9] rounded-xl p-1.5 flex gap-1 shadow-sm overflow-x-auto hide-scrollbar ${activeTab === 'market' ? 'max-w-3xl mx-auto' : ''}`}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#3674B5] text-white shadow-md'
                  : 'text-[#3674B5] hover:bg-[#D1F8EF] hover:text-[#2A598A]'
              }`}
            >
              <tab.icon size={16} className={isActive ? 'animate-pulse' : ''} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          
          {/* FEED CREATOR TAB */}
          {activeTab === 'feed' && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Creator Selector (Chat Heads) */}
              <div className="flex justify-between items-center mb-2">
                 <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">Select Visionary</h2>
                 <button
                    onClick={() => fetchFeed(selectedCreator.fid)}
                    disabled={loading}
                    className="p-2 text-[#3674B5] hover:bg-blue-50 rounded-full transition-colors"
                  >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                {visionaries.map((contact) => {
                  const isSelected = selectedCreator.fid === contact.fid;
                  return (
                    <button
                      key={contact.fid}
                      onClick={() => setSelectedCreator(contact)}
                      className={`flex flex-col items-center gap-2 transition-all duration-300 group ${
                        isSelected ? 'opacity-100 scale-105' : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className={`relative w-16 h-16 rounded-full p-1 ${isSelected ? 'bg-gradient-to-br from-[#3674B5] to-[#A1E3F9]' : 'bg-transparent'}`}>
                        <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 border-2 border-white relative z-10">
                          <img 
                            src={contact.pfp} // Using direct URL now
                            alt={contact.username}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {isSelected && (
                          <div className="absolute bottom-0 right-0 z-20 bg-[#3674B5] text-white p-1 rounded-full border-2 border-white shadow-sm">
                            <CheckCircle size={10} fill="currentColor" className="text-white" />
                          </div>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${isSelected ? 'text-[#3674B5]' : 'text-gray-400'}`}>
                        {contact.name ? contact.name.split(' ')[0] : '...'}
                      </span>
                    </button>
                  );
                })}
              </div>

               {/* MAIN CONTENT GRID (FEED + AI INSIGHT) */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                  
                  {/* LEFT: FEED (2 Cols Span) */}
                  <div className="lg:col-span-2 space-y-4">
                    {loading && (
                      <div className="space-y-6">
                        {[1, 2].map(i => ( 
                          <div key={i} className="animate-pulse bg-white p-5 rounded-2xl border border-gray-100 h-32 opacity-70">
                            <div className="flex gap-4">
                              <div className="w-10 h-10 bg-gray-200 rounded-full" />
                              <div className="space-y-2 flex-1 pt-2">
                                <div className="w-1/3 h-4 bg-gray-200 rounded" />
                                <div className="w-3/4 h-3 bg-gray-100 rounded" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {error && (
                      <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-center mt-8 border border-rose-100">
                        {error}
                      </div>
                    )}
                    
                    {!loading && data && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                      >
                        {Object.keys(data.feed).map((dateGroup) => (
                          <div key={dateGroup}>
                            <div className="sticky top-0 z-10 mb-4 flex justify-center pointer-events-none">
                              <span className="bg-[#EBFDFF]/95 backdrop-blur-sm text-[#3674B5] px-3 py-1 rounded-full text-xs font-bold border border-[#A1E3F9] shadow-sm">
                                {dateGroup}
                              </span>
                            </div>
                            <div className="space-y-4">
                              {data.feed[dateGroup].map((cast) => (
                                <CreatorFeedCard key={cast.hash} cast={cast} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* RIGHT: AI INSIGHT (1 Col Span) - Only show if data exists */}
                  <div className="hidden lg:block">
                     {!loading && data && (
                        <CoreInsightPanel 
                            casts={Object.values(data.feed).flat()} 
                            creatorName={selectedCreator.name} 
                        />
                     )}
                  </div>

               </div>
            </motion.div>
          )}

          {/* MARKET TAB */}
          {activeTab === 'market' && (
            <motion.div
              key="market"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <CoreMarketView />
            </motion.div>
          )}



        </AnimatePresence>
      </div>

       {/* Footer Note */}
       <div className="text-center text-xs text-gray-400 py-8 border-t border-dashed border-gray-200 mt-8">
          Core Mode Active • Enhanced Data Access Enabled
       </div>
    </div>
  );
}
