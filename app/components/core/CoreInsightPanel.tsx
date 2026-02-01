'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle, RefreshCcw } from 'lucide-react';

interface CoreInsightPanelProps {
  casts: any[];
  creatorName: string;
}

export default function CoreInsightPanel({ casts, creatorName }: CoreInsightPanelProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-clear insight when creator changes
  useEffect(() => {
    setInsight(null);
    setError('');
  }, [creatorName]);

  const generateInsight = async () => {
    if (!casts || casts.length === 0) return;

    setLoading(true);
    setError('');
    
    try {
      // Extract text from casts (limit to recent 10-15 to avoid token limits)
      const postsText = casts.slice(0, 15).map(c => c.text);

      const res = await fetch('/api/core/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            posts: postsText, 
            creatorName: creatorName 
        })
      });

      if (!res.ok) throw new Error('Failed to analyze');
      
      const json = await res.json();
      setInsight(json.insight);
      
    } catch (err) {
      console.error(err);
      setError('AI unavailable. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Simple Markdown Parser for Bold text (**text**)
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => (
      <p key={i} className="mb-2 text-sm leading-relaxed text-gray-700">
        {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="text-[#3674B5]">{part.slice(2, -2)}</strong>;
            }
            return part;
        })}
      </p>
    ));
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#A1E3F9] shadow-sm h-fit sticky top-4">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
           <img src="/icon-title.png" alt="Nova Analyst" className="w-10 h-10 rounded-lg object-contain" />
           <div>
               <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Nova Analyst</h3>
               <p className="text-[10px] text-gray-400 font-medium">Ready to analyze Creator post</p>
           </div>
        </div>
        
        {insight && !loading && (
             <button 
                onClick={generateInsight} 
                className="p-1.5 text-gray-400 hover:text-[#3674B5] hover:bg-blue-50 rounded-full transition-colors"
                title="Regenerate"
             >
                 <RefreshCcw size={14} />
             </button>
        )}
      </div>

      {/* Content */}
      <div className="min-h-[150px]">
          
          {/* Initial State */}
          {!insight && !loading && !error && (
              <div className="text-center py-8 px-4">
                  <p className="text-gray-400 text-xs mb-4">
                      Analyze {creatorName}'s recent posts for trading signals and sentiment.
                  </p>
                  <button 
                    onClick={generateInsight}
                    className="w-full py-3 bg-[#EBFDFF] hover:bg-[#D1F8EF] text-[#3674B5] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-[#A1E3F9] shadow-sm hover:shadow-md active:scale-95"
                  >
                      <Sparkles size={14} />
                      GENERATE INSIGHT
                  </button>
              </div>
          )}

          {/* Loading State */}
          {loading && (
              <div className="space-y-4 py-4 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-50 rounded w-full"></div>
                  <div className="h-3 bg-gray-50 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-50 rounded w-4/5"></div>
                  <div className="flex justify-center mt-4">
                      <span className="text-[10px] text-[#3674B5] font-bold animate-bounce">Analyzing Sentiment...</span>
                  </div>
              </div>
          )}

          {/* Error State */}
          {error && (
              <div className="bg-rose-50 text-rose-500 p-4 rounded-xl text-center border border-rose-100 flex flex-col items-center gap-2">
                  <AlertCircle size={20} />
                  <span className="text-xs font-bold">{error}</span>
                  <button onClick={generateInsight} className="text-[10px] underline mt-1">Retry</button>
              </div>
          )}

          {/* Success State */}
          {!loading && insight && (
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-gray-50/50 p-4 rounded-xl border border-gray-100"
              >
                  <div className="prose prose-sm max-w-none">
                      {renderMarkdown(insight)}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-200 text-[10px] text-gray-400 text-right italic">
                      Analysis based on last 48h activity
                  </div>
              </motion.div>
          )}

      </div>
    </div>
  );
}
