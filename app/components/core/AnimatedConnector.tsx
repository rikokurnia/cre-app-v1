'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Draws an animated connecting line between two elements identified by IDs.
 * Uses absolute positioning, so ensure parent has relative positioning.
 */
export const AnimatedConnector = ({ fromId, toId, trigger }: { fromId: string, toId: string, trigger: any }) => {
    const [coords, setCoords] = useState<{ x1: number, y1: number, x2: number, y2: number } | null>(null);

    useEffect(() => {
        const updateCoords = () => {
            const fromEl = document.getElementById(fromId);
            const toEl = document.getElementById(toId);
            const parent = document.getElementById('market-view-container'); // Need a common relative parent

            if (fromEl && toEl && parent) {
                const fromRect = fromEl.getBoundingClientRect();
                const toRect = toEl.getBoundingClientRect();
                const parentRect = parent.getBoundingClientRect();

                // Calculate relative coordinates
                // From: Right Center of Input
                const x1 = fromRect.right - parentRect.left;
                const y1 = fromRect.top + (fromRect.height / 2) - parentRect.top;
                
                // To: Left Center of Chart
                const x2 = toRect.left - parentRect.left;
                const y2 = toRect.top + (toRect.height / 2) - parentRect.top;

                setCoords({ x1, y1, x2, y2 });
            }
        };

        // Update on mount and trigger
        updateCoords();
        
        // Resize listener
        window.addEventListener('resize', updateCoords);
        return () => window.removeEventListener('resize', updateCoords);
    }, [fromId, toId, trigger]);

    if (!coords) return null;

    // Bezier Curve Logic
    // Control Point 1: Move right from start
    // Control Point 2: Move left from end
    const cpoffset = Math.abs(coords.x2 - coords.x1) * 0.5;
    const d = `M ${coords.x1} ${coords.y1} C ${coords.x1 + cpoffset} ${coords.y1}, ${coords.x2 - cpoffset} ${coords.y2}, ${coords.x2} ${coords.y2}`;

    return (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-50 overflow-visible">
             {/* Glow Effect */}
             <motion.path
                d={d}
                stroke="#3674B5"
                strokeWidth="4"
                fill="none"
                strokeOpacity="0.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />
            {/* Main Line */}
            <motion.path
                d={d}
                stroke="#A1E3F9"
                strokeWidth="2"
                fill="none"
                strokeDasharray="4 4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
            />
            {/* Moving Particle */}
            <motion.circle 
                r="4" 
                fill="#3674B5"
            >
                <animateMotion 
                   dur="1s" 
                   repeatCount="1"
                   path={d}
                />
            </motion.circle>
        </svg>
    );
};
