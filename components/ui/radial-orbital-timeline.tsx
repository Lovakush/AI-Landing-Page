"use client";
import { useState, useEffect, useRef } from "react";

interface TimelineItem {
  id: number;
  title: string;
  icon: React.ElementType;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
  selectedId: number | null;
  onSelectNode: (id: number | null) => void;
  isCompact?: boolean;
}

export default function RadialOrbitalTimeline({
  timelineData,
  selectedId,
  onSelectNode,
  isCompact = false,
}: RadialOrbitalTimelineProps) {
  const [mounted, setMounted] = useState(false);
  const rotationRef = useRef<number>(0);
  const hasInitialized = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Initialize rotation so the selected node starts at the top of the circle
  if (!hasInitialized.current && selectedId !== null) {
    const nodeIndex = timelineData.findIndex(item => item.id === selectedId);
    const totalNodes = timelineData.length;
    rotationRef.current = (270 - (nodeIndex / totalNodes) * 360 + 360) % 360;
    hasInitialized.current = true;
  }

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNodeClick = (id: number) => {
    onSelectNode(id);
  };

  // rAF-based rotation that updates DOM directly instead of causing React re-renders
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = now - lastTime;
      // 0.3 degrees per 50ms = 6 degrees/sec
      rotationRef.current = (rotationRef.current + (dt / 50) * 0.3) % 360;

      // Update node positions directly in the DOM
      const total = timelineData.length;
      const radius = isCompact ? 140 : 200;
      timelineData.forEach((item, index) => {
        const angle = ((index / total) * 360 + rotationRef.current) % 360;
        const radian = (angle * Math.PI) / 180;
        const x = radius * Math.cos(radian);
        const y = radius * Math.sin(radian);
        const zIndex = Math.round(100 + 50 * Math.cos(radian));
        const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));

        const nodeEl = nodeRefs.current[item.id];
        if (nodeEl) {
          nodeEl.style.transform = `translate(${x}px, ${y}px)`;
          nodeEl.style.zIndex = String(zIndex);
          nodeEl.style.opacity = String(selectedId !== null && selectedId !== item.id ? 0.5 : (selectedId === item.id ? 1 : opacity));
        }
      });

      lastTime = now;
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [timelineData, isCompact, selectedId]);

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationRef.current) % 360;
    const radius = isCompact ? 140 : 200;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(
      0.4,
      Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2))
    );

    return { x, y, angle, zIndex, opacity };
  };

  // Sizes based on compact mode
  const centerSize = isCompact ? "w-16 h-16" : "w-24 h-24";
  const centerInnerSize = isCompact ? "w-8 h-8" : "w-12 h-12";
  const pingSize1 = isCompact ? "w-20 h-20" : "w-28 h-28";
  const pingSize2 = isCompact ? "w-24 h-24" : "w-32 h-32";
  const orbitSize = isCompact ? "w-[280px] h-[280px]" : "w-[400px] h-[400px]";
  const nodeSize = isCompact ? "w-12 h-12" : "w-14 h-14";
  const iconSize = isCompact ? 18 : 22;
  const containerHeight = isCompact ? "h-[400px]" : "h-[550px]";

  // Don't render dynamic content until mounted (fixes hydration)
  if (!mounted) {
    return (
      <div className={`w-full ${containerHeight} flex flex-col items-center justify-center overflow-visible`}>
        <div className="relative w-full h-full flex items-center justify-center">
          <div className={`absolute ${centerSize} rounded-full bg-gradient-to-br from-[#A855F7] via-[#8B5CF6] to-[#6B4E9B] animate-pulse flex items-center justify-center z-10`}>
            <div className={`${centerInnerSize} rounded-full bg-white/80 backdrop-blur-md`}></div>
          </div>
          <div className={`absolute ${orbitSize} rounded-full border border-[#A855F7]/20`}></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full ${containerHeight} flex flex-col items-center justify-center overflow-visible`}
      ref={containerRef}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
          style={{
            perspective: "1000px",
          }}
        >
          {/* Center orb */}
          <div className={`absolute ${centerSize} rounded-full bg-gradient-to-br from-[#A855F7] via-[#8B5CF6] to-[#6B4E9B] animate-pulse flex items-center justify-center z-10`}>
            <div className={`absolute ${pingSize1} rounded-full border border-[#A855F7]/30 animate-ping opacity-70`}></div>
            <div
              className={`absolute ${pingSize2} rounded-full border border-[#A855F7]/20 animate-ping opacity-50`}
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div className={`${centerInnerSize} rounded-full bg-white/80 backdrop-blur-md`}></div>
          </div>

          {/* Orbit ring */}
          <div className={`absolute ${orbitSize} rounded-full border border-[#A855F7]/20`}></div>

          {/* Nodes */}
          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isSelected = selectedId === item.id;
            const Icon = item.icon;

            const nodeStyle = {
              transform: `translate(${position.x}px, ${position.y}px)`,
              zIndex: isSelected ? 200 : position.zIndex,
              opacity: selectedId !== null && !isSelected ? 0.5 : (isSelected ? 1 : position.opacity),
            };

            return (
              <div
                key={item.id}
                ref={(el) => {
                  nodeRefs.current[item.id] = el;
                }}
                className="absolute cursor-pointer"
                style={{
                  ...nodeStyle,
                  transition: 'opacity 0.3s ease',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeClick(item.id);
                }}
              >
                {/* Glow effect for selected */}
                {isSelected && (
                  <div
                    className="absolute rounded-full animate-pulse"
                    style={{
                      background: `radial-gradient(circle, rgba(232,184,74,0.4) 0%, rgba(232,184,74,0) 70%)`,
                      width: '80px',
                      height: '80px',
                      left: '-20px',
                      top: '-20px',
                    }}
                  ></div>
                )}

                <div
                  className={`
                    ${nodeSize} rounded-full flex items-center justify-center
                    ${isSelected
                      ? "bg-[#E8B84A] text-[#2D1B4E] scale-125 shadow-[0_0_30px_rgba(232,184,74,0.6)]"
                      : "bg-[#2D1B4E] text-white hover:bg-[#3d2a5f]"
                    }
                    border-2
                    ${isSelected
                      ? "border-[#E8B84A]"
                      : "border-[#A855F7]/50 hover:border-[#A855F7]"
                    }
                    transition-all duration-300 transform
                  `}
                >
                  <Icon size={iconSize} />
                </div>

                <div
                  className={`
                    absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap
                    text-xs font-semibold tracking-wider
                    transition-all duration-300
                    ${isSelected ? "text-[#E8B84A] scale-110" : "text-white/70"}
                  `}
                >
                  {item.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
