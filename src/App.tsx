/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Star, Sparkles, ArrowRight, ArrowLeft, ExternalLink, Copy, Check, X, Plus } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Components ---

const EyeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" strokeWidth="0.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" className="animate-ping opacity-75" />
  </svg>
);

const SharpStarIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className={className}>
    <polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9 12 2" />
  </svg>
);



const AnimatedEye = () => (
  <div className="mx-4 flex items-center justify-center scale-105">
    <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1" className="w-8 h-8">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <motion.g
        animate={{ 
          x: [-4, 4, 2, -3, -4],
          y: [-2, 2, -1, 1, -2]
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ color: '#FFFFFF' }}
      >
        <circle cx="12" cy="12" r="3" strokeWidth="1" />
        <circle cx="12" cy="12" r="1" fill="currentColor" className="opacity-75" />
      </motion.g>
    </svg>
  </div>
);

const WireframeGlobe = () => {
  return (
    <div className="fixed inset-0 z-0 flex items-center justify-center md:justify-end overflow-hidden pointer-events-none">
      <div className="relative w-[80vw] h-[80vw] md:w-[35vw] md:h-[35vw] md:mr-[2vw] opacity-40" style={{ perspective: '1000px' }}>
        <motion.div
          className="w-full h-full relative"
          style={{ transformStyle: 'preserve-3d' }}
          initial={{ rotateX: 35, rotateZ: 10 }}
          animate={{ rotateY: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          {/* Atmosphere Glow */}
          <div className="absolute inset-0 rounded-full bg-[var(--color-neon)]/5 blur-3xl transform-gpu" />

          {/* Meridians (Longitudes) */}
          {[0, 30, 60, 90, 120, 150].map((deg) => (
            <div
              key={`meridian-${deg}`}
              className="absolute inset-0 rounded-full border-[1px] border-[var(--color-neon)]/30"
              style={{ transform: `rotateY(${deg}deg)` }}
            />
          ))}

          {/* Equator */}
          <div className="absolute inset-0 rounded-full border-[1px] border-[var(--color-neon)]/40" style={{ transform: 'rotateX(90deg)' }} />
          
          {/* Parallels (Latitudes) */}
          {[1, 2, 3].map((i) => {
             const angle = i * 0.35; // approx 20, 40, 60 degrees
             const scale = Math.cos(angle);
             const yOffset = Math.sin(angle) * 50; 
             
             return (
                <React.Fragment key={`lat-${i}`}>
                   <div 
                     className="absolute inset-0 rounded-full border-[1px] border-[var(--color-neon)]/20"
                     style={{ 
                       transform: `translateY(-${yOffset}%) rotateX(90deg) scale(${scale})` 
                     }} 
                   />
                   <div 
                     className="absolute inset-0 rounded-full border-[1px] border-[var(--color-neon)]/20"
                     style={{ 
                       transform: `translateY(${yOffset}%) rotateX(90deg) scale(${scale})` 
                     }} 
                   />
                </React.Fragment>
             );
          })}
        </motion.div>
      </div>
    </div>
  );
};

const SwirlBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30 mix-blend-screen">
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vmax] h-[200vmax]"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0%, var(--color-neon) 10%, transparent 20%, var(--color-neon) 30%, transparent 40%, var(--color-neon) 50%, transparent 60%, var(--color-neon) 70%, transparent 80%, var(--color-neon) 90%, transparent 100%)',
          filter: 'blur(60px)',
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_70%)]" />
    </div>
  );
};

const NoiseOverlay = () => (
  <div className="pointer-events-none absolute inset-0 z-50 opacity-20 mix-blend-overlay">
    <svg className="h-full w-full">
      <filter id="noiseFilter">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.8"
          numOctaves="3"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  </div>
);

const SprayFilter = () => (
  <svg className="absolute w-0 h-0 pointer-events-none">
    <filter id="sprayNoise" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3.8" result="blur" />
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" />
      <feDisplacementMap in="blur" in2="noise" scale="11.4" />
    </filter>
  </svg>
);

const GlitchText = ({ text, className }: { text: string; className?: string }) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span
        className="absolute top-0 left-0 -z-10 translate-x-[2px] text-red-500 opacity-70 mix-blend-screen"
        aria-hidden="true"
      >
        {text}
      </span>
      <span
        className="absolute top-0 left-0 -z-10 -translate-x-[2px] text-blue-500 opacity-70 mix-blend-screen"
        aria-hidden="true"
      >
        {text}
      </span>
    </div>
  );
};

const CrossedMarquees = () => {
  return (
    <div className="absolute inset-0 z-0 h-full w-full overflow-hidden pointer-events-none translate-y-[12px] md:translate-y-[80px]">
      {/* Static Strip - Tilted down-right */}
      <div className="absolute md:top-[24%] top-[17%] -left-10 w-[120vw] bg-black py-2 -rotate-6 md:rotate-3 translate-y-5 border-y-2 border-white transform-gpu opacity-90">
        <div
          className="flex whitespace-nowrap"
        >
          {[...Array(20)].map((_, i) => (
            <span
              key={i}
              className="mx-4 font-stencil text-[10px] md:text-xl font-black tracking-widest text-white uppercase"
            >
              PELIGRO •
            </span>
          ))}
        </div>
      </div>

      {/* White Strip - Tilted up-right (crossing) */}
      <div className="absolute  top-[22%] md:top-[27%] -left-10 w-[120vw] bg-white py-2 rotate-6 md:-rotate-2 -translate-y-5 shadow-lg mix-blend-hard-light transform-gpu opacity-90">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: [-1000, 0] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 25,
          }}
        >
          {[...Array(20)].map((_, i) => (
            <span
              key={i}
              className="mx-4 font-stencil text-[10px] md:text-xl font-black tracking-widest text-black uppercase"
            >
              NO ES COINCIDENCIA. NO ES UNA TEORÍA. EL RELOJ YA EMPEZÓ. •
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

interface ManifestoCardProps {
  title: string;
  copy: string[];
  isOpen?: boolean;
  onToggle?: () => void;
}

const ScreenGlitch: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 450); // 300ms-500ms
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden"
    >
      {/* Pixel Shifts and Fragments */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0.8, 0],
            x: [(Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200],
            y: [(Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200],
            scaleX: [1, 5, 0.1, 1],
            scaleY: [1, 0.1, 5, 1],
          }}
          transition={{
            duration: 0.1,
            repeat: 4,
            ease: "linear"
          }}
          className="absolute bg-white mix-blend-difference"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 400}px`,
            height: `${Math.random() * 20}px`,
          }}
        />
      ))}
      
      {/* Flash of Neon */}
      <motion.div
        animate={{ opacity: [0, 0.3, 0, 0.5, 0] }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 bg-[var(--color-neon)]"
      />

      {/* Static Noise */}
      <div className="absolute inset-0 opacity-30 mix-blend-overlay">
        <svg className="h-full w-full">
          <filter id="glitchNoise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#glitchNoise)" />
        </svg>
      </div>
    </motion.div>
  );
};

const GlitchCTA = ({ children, href, onClick, className, style, isExternal }: { 
  children: React.ReactNode, 
  href?: string, 
  onClick?: () => void, 
  className?: string, 
  style?: React.CSSProperties,
  isExternal?: boolean
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [textGlitch, setTextGlitch] = useState(false);
  const [bgGlitch, setBgGlitch] = useState(false);
  const [bgOffset, setBgOffset] = useState(0);

  useEffect(() => {
    let textTimeout: any;
    let bgTimeout: any;
    let interval: any;

    const triggerGlitches = () => {
      if (!isHovered) return;

      // Text Glitch: 150-250ms
      setTextGlitch(true);
      textTimeout = setTimeout(() => setTextGlitch(false), 150 + Math.random() * 100);

      // Background Glitch: 100-200ms
      setBgGlitch(true);
      setBgOffset((Math.random() - 0.5) * 4); // Subtle 1-2px displacement each way
      bgTimeout = setTimeout(() => {
        setBgGlitch(false);
        setBgOffset(0);
      }, 100 + Math.random() * 100);

      // Schedule next burst
      interval = setTimeout(triggerGlitches, 600 + Math.random() * 1200);
    };

    if (isHovered) {
      triggerGlitches();
    } else {
      setTextGlitch(false);
      setBgGlitch(false);
      setBgOffset(0);
    }

    return () => {
      clearTimeout(textTimeout);
      clearTimeout(bgTimeout);
      clearTimeout(interval);
    };
  }, [isHovered]);

  const renderChildren = (node: React.ReactNode): React.ReactNode => {
    return React.Children.map(node, (child) => {
      if (typeof child === 'string') {
        return child.split('').map((char, i) => (
          <motion.span
            key={i}
            className="inline-block"
            animate={textGlitch ? {
              x: [(Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, 0],
              y: [(Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, 0],
            } : { x: 0, y: 0 }}
            transition={{
              delay: i * 0.015, // Slightly faster stagger
              duration: 0.1,
              ease: "linear"
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ));
      }
      if (React.isValidElement(child)) {
        const element = child as React.ReactElement;
        if (element.props.children && typeof element.props.children !== 'function') {
          return React.cloneElement(element, {
            children: renderChildren(element.props.children)
          });
        }
        return (
          <motion.span
            className="inline-block"
            animate={textGlitch ? {
              x: [(Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, 0],
              y: [(Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, 0],
            } : { x: 0, y: 0 }}
            transition={{ duration: 0.1, ease: "linear" }}
          >
            {child}
          </motion.span>
        );
      }
      return child;
    });
  };

  const commonProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    className: `group relative border-2 border-white bg-black px-8 py-4 font-stencil text-base uppercase tracking-widest text-white transition-all hover:border-[var(--color-neon)] hover:text-[var(--color-neon)] ${className}`,
    animate: bgGlitch ? {
      x: [0, bgOffset, -bgOffset, 0],
      skewX: [0, bgOffset * 1.5, 0],
      filter: [
        'none',
        'drop-shadow(2px 0 #ff003c) drop-shadow(-2px 0 #00f2ff)',
        'none'
      ]
    } : { x: 0, skewX: 0, filter: 'none' },
    transition: { duration: 0.12, ease: "linear" },
    style: { clipPath: 'polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%)', ...style },
  };

  const content = (
    <div className="relative flex items-center justify-center gap-3">
      {renderChildren(children)}
    </div>
  );

  const bgGlitchLayer = bgGlitch && (
    <div 
      className="absolute inset-0 -z-20 bg-white/5"
      style={{ 
        clipPath: `inset(${Math.random() * 60}% 0 ${Math.random() * 60}% 0)`,
        transform: `translate(${bgOffset * -3}px, 0)`
      }}
    />
  );

  if (isExternal && href) {
    return (
      <motion.a href={href} target="_blank" rel="noopener noreferrer" {...commonProps}>
        {content}
        <div className="absolute inset-0 -z-10 translate-x-1 translate-y-1 bg-[var(--color-neon)] opacity-0 transition-opacity group-hover:opacity-20" />
        {bgGlitchLayer}
      </motion.a>
    );
  }

  return (
    <motion.button onClick={onClick} {...commonProps}>
      {content}
      <div className="absolute inset-0 -z-10 translate-x-1 translate-y-1 bg-[var(--color-neon)] opacity-0 transition-opacity group-hover:opacity-20" />
      {bgGlitchLayer}
    </motion.button>
  );
};

const LivePage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [copied, setCopied] = useState(false);
  const [showCTAs, setShowCTAs] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCTAs(true);
    }, 20000);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText("FIN2026");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="relative z-10 flex h-full w-full flex-col p-4 md:p-8"
    >
      {/* Back Button (Bottom Left) */}
      <motion.button
        onClick={onBack}
        whileHover={{ 
          x: [0, -2, 2, -1, 1, 0],
          y: [0, 1, -1, 2, -2, 0],
          transition: { duration: 0.2, repeat: Infinity }
        }}
        className="fixed bottom-20 left-8 z-50 text-white transition-colors hover:text-[var(--color-neon)]"
      >
        <ArrowLeft size={32} />
      </motion.button>

      {/* Header */}
      <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row md:mt-6 md:mb-6">
        <h1 className="font-black tracking-tighter text-[var(--color-neon)] text-3xl md:text-5xl uppercase">
          EL FIN LLEGÓ
        </h1>

        {/* Desktop CTAs */}
        <motion.div 
          className="hidden md:flex flex-row gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: showCTAs ? 1 : 0 }}
          transition={{ duration: 1 }}
          style={{ pointerEvents: showCTAs ? 'auto' : 'none' }}
        >
          <GlitchCTA
            href="https://www.rappi.com"
            isExternal
            className="w-full md:w-auto"
          >
            <span>Comprar en Rappi</span>
            <ExternalLink size={18} />
          </GlitchCTA>

          <GlitchCTA
            onClick={handleCopy}
            className="w-full md:w-auto"
          >
            <span>{copied ? "¡Copiado!" : "Copiar Código"}</span>
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </GlitchCTA>
        </motion.div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 animate-pulse rounded-full bg-red-600 shadow-[0_0_10px_red]" />
            <span className="font-stencil text-sm font-bold uppercase tracking-widest text-red-600">En Vivo</span>
          </div>
        </div>
      </div>

      {/* Main Content: Video Only */}
      <div className="flex flex-1 flex-col gap-4">
        {/* Video Section (90%) */}
        <div className="relative aspect-video w-[90%] mx-auto">
          <iframe
            className="h-full w-full shadow-2xl"
            src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&rel=0"
            title="Live Stream"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      {/* Mobile CTAs */}
      <motion.div 
        className="flex md:hidden flex-col items-center gap-4 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: showCTAs ? 1 : 0 }}
        transition={{ duration: 1 }}
        style={{ pointerEvents: showCTAs ? 'auto' : 'none' }}
      >
        <GlitchCTA
          href="https://www.rappi.com"
          isExternal
          className="w-full md:w-auto"
        >
          <span>Comprar en Rappi</span>
          <ExternalLink size={18} />
        </GlitchCTA>

        <GlitchCTA
          onClick={handleCopy}
          className="w-full md:w-auto"
        >
          <span>{copied ? "¡Copiado!" : "Copiar Código"}</span>
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </GlitchCTA>
      </motion.div>
      
      {/* Footer Text - REMOVED */}

    </motion.div>
  );
};

const ManifestoCard: React.FC<ManifestoCardProps> = ({ 
  title, 
  copy,
  isOpen = false,
  onToggle
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [isFlickering, setIsFlickering] = useState(false);
  const [baseHeight, setBaseHeight] = useState(128);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setBaseHeight(mobile ? 102 : 128);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isExpanded = isMobile ? isOpen : isHovered;

  const handleMouseEnter = () => {
    if (isMobile) return;
    if (isHovered) return;
    setIsGlitching(true);
    
    setTimeout(() => {
      setIsGlitching(false);
      setIsFlickering(true);
      setTimeout(() => {
        setIsFlickering(false);
        setIsHovered(true);
      }, 100);
    }, 250);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setIsHovered(false);
    setIsGlitching(false);
    setIsFlickering(false);
  };

  const handleClick = () => {
    if (isMobile && onToggle) {
      onToggle();
    }
  };

  return (
    <div className="relative w-full md:h-[128px] md:w-[300px]">
      <motion.div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        animate={{ 
          height: isExpanded ? 'auto' : baseHeight,
          scale: (!isMobile && isExpanded) ? 1.05 : 1,
          zIndex: isExpanded ? 60 : 20
        }}
        transition={{ 
          height: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
          scale: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
          zIndex: { duration: 0 }
        }}
        className="relative md:absolute top-0 left-0 w-full cursor-pointer overflow-hidden border-2 border-white bg-black transition-colors hover:border-[var(--color-neon)]"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 90% 100%, 0 100%)' }}
      >
        {/* Urban Texture: Scanlines */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.05)_50%)] bg-[length:100%_4px] opacity-50" />
        
        {/* Glitch Decoration: Corner Dots */}
        <div className="absolute top-2 left-2 h-1 w-1 bg-[var(--color-neon)] z-10" />
        <div className="absolute bottom-2 right-2 h-1 w-1 bg-white z-10" />
        <div className="absolute top-2 right-2 h-1 w-1 bg-white/20 z-10" />
        <div className="absolute bottom-2 left-2 h-1 w-1 bg-white/20 z-10" />

        {/* Glitch Slices */}
        {isGlitching && (
          <div className="absolute inset-0 z-30 bg-black overflow-hidden">
             {/* Background Shift */}
             <motion.div 
               className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.1)_50%)] bg-[length:100%_4px]"
               animate={{ x: [-2, 2, -2, 2, 0] }}
               transition={{ duration: 0.2, ease: "easeInOut", repeat: Infinity }}
             />
             
             {/* Text Shift */}
             <motion.div
               className="absolute inset-0 flex items-center justify-center px-4 text-center"
               animate={{ x: [-2, 2, -1, 1, 0] }}
               transition={{ duration: 0.15, ease: "linear", repeat: Infinity }}
             >
               <span className="font-stencil text-xl uppercase leading-tight text-white" style={{ textShadow: '-1px 0 white, 1px 0 white' }}>{title}</span>
             </motion.div>
          </div>
        )}

        {/* Content Container with 16px padding (p-4) - Adjusted pb-2 for 8px bottom gap */}
        <motion.div
          className={`relative flex h-full w-full flex-col items-center pt-4 px-4 ${isExpanded ? 'pb-2' : 'pb-4'} text-center`}
          animate={isFlickering ? { x: [-2, 2, -1, 1, 0] } : { x: 0 }}
          transition={isFlickering ? { duration: 0.05, repeat: Infinity } : {}}
        >
          {/* Title - Positioned to be centered in the 108px collapsed state */}
          <motion.div 
            className="flex h-[76px] items-center justify-center"
            animate={{ 
              y: isExpanded ? 0 : 0,
              scale: isExpanded ? 0.75 : 1
            }}
            transition={{ duration: 0.3 }}
          >
            <h3 className={`font-stencil text-xl uppercase tracking-wider transition-colors md:text-2xl ${isExpanded ? 'text-[var(--color-neon)]' : 'text-white'}`}>
              {title}
            </h3>
          </motion.div>

          {/* Copy - Revealed smoothly */}
          <motion.div
            initial={false}
            animate={{ 
              opacity: isExpanded ? 1 : 0,
              height: isExpanded ? 'auto' : 0,
              marginTop: isExpanded ? 16 : 0
            }}
            transition={{ duration: 0.4 }}
            className="w-full space-y-3 overflow-hidden"
          >
            {copy.map((line, idx) => (
              <div key={idx} className="relative">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={isExpanded ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ 
                    delay: isExpanded ? 0.1 + (idx * 0.05) : 0,
                    duration: 0.3
                  }}
                  className="font-stencil text-xs leading-tight text-white/90 uppercase tracking-tight"
                >
                  {line}
                </motion.p>
                <motion.div 
                  className="h-[1px] w-full bg-white/10 mt-1"
                  initial={{ scaleX: 0 }}
                  animate={isExpanded ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ delay: 0.2 + (idx * 0.05) }}
                />
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scanline Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_2px] opacity-20" />

        {/* Tertiary CTA */}
        <motion.div 
          className="absolute bottom-3 right-3 z-20 flex items-center gap-1"
          animate={{ opacity: isExpanded ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <span className="font-stencil text-[10px] uppercase tracking-widest text-white/50 transition-colors group-hover:text-[var(--color-neon)]">
            descubre más
          </span>
          <Plus size={12} className="text-white/50 transition-colors group-hover:text-[var(--color-neon)]" />
        </motion.div>
      </motion.div>
    </div>
  );
};

const ManifestoSection = () => {
  const [openCardIndex, setOpenCardIndex] = useState<number | null>(null);

  const cards = [
    {
      title: "LOS SÍMBOLOS",
      copy: [
        "Han estado ahí.",
        "En canciones.",
        "En escenarios.",
        "En portadas.",
        "No es estética.",
        "Es repetición.",
        "Y la repetición nunca es casual."
      ]
    },
    {
      title: "COMPORTAMIENTO ANIMAL",
      copy: [
        "Rutas alteradas.",
        "Migraciones fuera de tiempo.",
        "Silencios donde antes había ruido.",
        "Explosiones donde antes había tranquilidad.",
        "Ellos reaccionan antes.",
        "Nosotros entendemos después."
      ]
    },
    {
      title: "LA ALINEACIÓN",
      copy: [
        "No es un eclipse más.",
        "No es una coincidencia.",
        "Cuando los cuerpos se alinean,",
        "lo invisible encuentra paso.",
        "La historia lo registra.",
        "Siempre ocurre algo después."
      ]
    }
  ];

  return (
    <div className="mt-24 flex w-full flex-col items-center">
      <h2 className="mb-6 font-stencil text-[28px] uppercase tracking-[0.2em] text-white flex items-center justify-center">
        LAS <AnimatedEye /> SEÑALES
      </h2>
      <div className="flex w-full flex-row flex-wrap justify-center gap-4 md:gap-16 pb-32 px-3 md:px-8">
        {cards.map((card, i) => (
          <ManifestoCard
            key={i}
            title={card.title}
            copy={card.copy}
            isOpen={openCardIndex === i}
            onToggle={() => setOpenCardIndex(openCardIndex === i ? null : i)}
          />
        ))}
      </div>
    </div>
  );
};

const CountdownBox: React.FC<{ interval: string, value: number, isTransitioning: boolean, index: number }> = ({ interval, value, isTransitioning, index }) => {
  const [phase, setPhase] = useState<'idle' | 'vibrating' | 'dropping'>('idle');
  
  useEffect(() => {
    if (isTransitioning) {
      setPhase('vibrating');
      const vibDuration = 600 + Math.random() * 300;
      const timer = setTimeout(() => {
        setPhase('dropping');
      }, vibDuration);
      return () => clearTimeout(timer);
    } else {
      setPhase('idle');
    }
  }, [isTransitioning]);

  return (
    <motion.div
      animate={
        phase === 'vibrating' ? {
          x: [0, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, 0],
          y: [0, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, 0],
          rotate: [0, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, 0],
        } : phase === 'dropping' ? {
          y: [0, 100],
          opacity: [1, 0],
          rotate: index % 2 === 0 ? 25 : -25,
        } : {
          x: 0,
          y: 0,
          rotate: 0,
          opacity: 1
        }
      }
      transition={
        phase === 'vibrating' ? {
          duration: 0.08,
          repeat: Infinity,
          ease: "linear"
        } : phase === 'dropping' ? {
          duration: 0.3 + Math.random() * 0.3,
          ease: "easeIn"
        } : {
          duration: 0.3
        }
      }
      className="group relative flex flex-1 md:flex-none flex-col items-center min-w-0"
    >
      {/* Glitch/Shadow Layer */}
      <div 
        className="absolute inset-0 translate-x-1 translate-y-1 bg-[var(--color-neon)] opacity-0 transition-opacity duration-100 group-hover:opacity-100" 
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 90% 100%, 0 100%)' }}
      />
      
      {/* Main Container */}
      <div 
        className="relative flex w-full aspect-square flex-col items-center justify-center overflow-hidden border-2 border-white bg-black md:h-32 md:w-32"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 90% 100%, 0 100%)' }}
      >
        {/* Urban Texture: Scanlines */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.1)_50%)] bg-[length:100%_4px]" />
        
        {/* Glitch Decoration: Top Bar */}
        <div className="absolute top-0 left-0 h-1 w-full bg-white/20" />
        
        <span className="font-stencil text-[8vw] md:text-6xl font-bold text-[var(--color-neon)] drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
          {String(value).padStart(2, '0')}
        </span>
        
        {/* Glitch Decoration: Random bits */}
        <div className="absolute bottom-2 right-2 h-1 w-1 bg-white" />
        <div className="absolute top-2 left-2 h-1 w-1 bg-[var(--color-neon)]" />
      </div>

      {/* Label Tape */}
      <div className="absolute -bottom-3 z-10 -rotate-2 bg-white px-2 py-0.5 shadow-lg">
        <span className="font-stencil text-xs font-black tracking-[0.2em] text-black uppercase">
          {interval}
        </span>
      </div>
    </motion.div>
  );
};

const Countdown = ({ onZero, isTransitioning }: { onZero?: () => void, isTransitioning: boolean }) => {
  const targetDate = new Date('2026-03-12T00:00:00');
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +targetDate - +new Date();
    let timeLeft: any = {};

    if (difference > 0) {
      timeLeft = {
        días: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hrs: Math.floor((difference / (1000 * 60 * 60)) % 24),
        min: Math.floor((difference / 1000 / 60) % 60),
        seg: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = {
        días: 0,
        hrs: 0,
        min: 0,
        seg: 0,
      };
    }
    return timeLeft;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const newTime = calculateTimeLeft();
      setTimeLeft(newTime);
      
      if (onZero && Object.values(newTime).every(val => val === 0)) {
        onZero();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, onZero]);

  const timeKeys = Object.keys(timeLeft) as Array<keyof typeof timeLeft>;

  return (
    <div className="mt-[112px] md:mt-[68px] flex w-full flex-nowrap justify-between gap-2 md:justify-center md:gap-6">
      {timeKeys.map((interval, idx) => (
        <CountdownBox 
          key={interval as string} 
          interval={interval as string} 
          value={timeLeft[interval]} 
          isTransitioning={isTransitioning}
          index={idx}
        />
      ))}
    </div>
  );
};

const GlitchChar = ({ char, trigger, delay }: { char: string, trigger: number, delay: number }) => {
  if (trigger === 0) return <span className="inline-block">{char}</span>;

  // Random keyframes for glitch effect
  const x = [0, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 5, 0];
  const y = [0, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, 0];
  const skew = [0, (Math.random() - 0.5) * 25, (Math.random() - 0.5) * 10, 0];

  return (
    <motion.span
      className="inline-block"
      animate={{
        x,
        y,
        skewX: skew,
        opacity: [1, 0.6, 1, 0.8, 1],
      }}
      transition={{
        duration: 0.2,
        ease: "easeInOut",
        delay: delay
      }}
    >
      {char}
    </motion.span>
  );
};

const TitleGlitchWord = () => {
  return (
    <div className="flex items-center justify-center -mt-2 md:-mt-4 text-white scale-[0.85] md:scale-90">
      AC3RCA
    </div>
  );
};

export default function App() {
  const [isLive, setIsLive] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showBottomAlert, setShowBottomAlert] = useState(true);

  const triggerTransition = useCallback(() => {
    if (isTransitioning || isExploding || isLive) return;
    setIsTransitioning(true);
    // After vibration and drop (~1.4s), start screen glitch
    setTimeout(() => {
      setIsTransitioning(false);
      setIsExploding(true);
    }, 1400);
  }, [isTransitioning, isExploding, isLive]);

  const handleExplosionComplete = useCallback(() => {
    setIsExploding(false);
    setIsLive(true);
    // Scroll to top when going live
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="relative h-screen w-full overflow-x-hidden overflow-y-auto bg-black text-white selection:bg-[var(--color-neon)] selection:text-black">
      <NoiseOverlay />
      <SprayFilter />

      {/* Background Elements / Grid */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-10">
        {[...Array(36)].map((_, i) => (
          <div key={i} className="border-[0.5px] border-white/20" />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {isExploding && (
          <ScreenGlitch key="glitch" onComplete={handleExplosionComplete} />
        )}

        {!isLive && !isExploding && (
          <motion.div 
            key="countdown-page"
            exit={{ opacity: 0 }}
            className="relative z-10 flex h-full w-full flex-col items-center justify-start pt-16 pb-32 px-3"
          >
            <SwirlBackground />
            <CrossedMarquees />

            {/* Main Title */}
            <div className="relative z-10 -rotate-2 text-center translate-y-0 md:-translate-y-4 w-full">
              <h1 className="relative z-20 mix-blend-difference font-stencil text-[22vw] leading-[0.8] font-black uppercase tracking-[0] md:text-8xl lg:text-[9rem]">
                <div className="block mb-2">
                  <span className="text-[var(--color-neon)] flex items-center justify-center gap-2 md:gap-16 lg:gap-24 text-[5.6vw] md:text-xl lg:text-[2.5rem]">
                    3L F1N D3L MUNDO S3
                  </span>
                </div>
                <TitleGlitchWord />
              </h1>
            </div>
            
            {/* Countdown & Manifesto */}
            <div className="-mt-[25px] flex w-full flex-col items-center z-30 rotate-1 scale-90 md:scale-100">
               <Countdown onZero={triggerTransition} isTransitioning={isTransitioning} />
               <ManifestoSection />
            </div>

            {/* Temporary Arrow Button */}
            <motion.button
              onClick={triggerTransition}
              whileHover={{ 
                x: [0, -2, 2, -1, 1, 0],
                y: [0, 1, -1, 2, -2, 0],
                transition: { duration: 0.2, repeat: Infinity }
              }}
              className="fixed bottom-20 right-8 z-50 text-white transition-colors hover:text-[var(--color-neon)]"
            >
              <ArrowRight size={29} />
            </motion.button>
          </motion.div>
        )}

        {isLive && (
          <div className="relative min-h-screen w-full">
            <SwirlBackground />
            <LivePage key="live-page" onBack={() => setIsLive(false)} />
          </div>
        )}
      </AnimatePresence>


      
      {/* Scanline effect */}
      
    </main>
  );
}

