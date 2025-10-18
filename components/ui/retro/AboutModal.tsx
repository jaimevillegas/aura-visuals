'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [language, setLanguage] = useState<'en' | 'es'>('en')

  // Handle opening animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      setIsClosing(false)
    }
  }, [isOpen])

  // Handle closing animation
  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsAnimating(false)
      onClose()
    }, 300) // Duration of closing animation
  }

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsClosing(true)
        setTimeout(() => {
          setIsAnimating(false)
          onClose()
        }, 300)
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
      return () => window.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])

  if (!isOpen && !isAnimating) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "transition-opacity duration-300",
        isClosing ? "opacity-0" : "opacity-100"
      )}
      onClick={handleClose}
    >
      {/* Backdrop with animated scanlines */}
      <div
        className="absolute inset-0 bg-black/90"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 255, 65, 0.03) 2px,
              rgba(0, 255, 65, 0.03) 4px
            )
          `
        }}
      />

      {/* Modal Container */}
      <div
        className={cn(
          "relative max-w-2xl w-full",
          isClosing ? "animate-tvOff" : "animate-tvOn"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing border effect */}
        <div
          className="absolute inset-0 rounded-lg blur-xl opacity-50"
          style={{
            background: 'linear-gradient(45deg, #00ff41, #00ffff, #00ff41)',
            animation: 'borderGlow 3s linear infinite',
          }}
        />

        {/* Main modal box */}
        <div
          className="relative bg-retro-panel border-4 border-neon-green rounded-lg overflow-hidden"
          style={{
            boxShadow: `
              0 0 20px rgba(0, 255, 65, 0.5),
              inset 0 0 30px rgba(0, 255, 65, 0.1),
              inset 0 4px 20px rgba(0, 0, 0, 0.8)
            `
          }}
        >
          {/* Header */}
          <div
            className="relative border-b-2 border-neon-green/50 bg-black/50 p-4"
            style={{
              boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)'
            }}
          >
            <div className="flex items-center justify-between">
              <h2
                className="text-2xl font-ui font-bold text-neon-green uppercase tracking-wider"
                style={{
                  textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor'
                }}
              >
                ▸ {language === 'en' ? 'About Aura Visuals' : 'Acerca de Aura Visuals'}
              </h2>
              <div className="flex items-center gap-2">
                {/* Language Toggle */}
                <div className="flex border-2 border-neon-green/50 rounded overflow-hidden">
                  <button
                    onClick={() => setLanguage('en')}
                    className={cn(
                      'px-3 py-1 text-xs font-ui font-bold uppercase transition-all duration-200',
                      language === 'en'
                        ? 'bg-neon-green text-black'
                        : 'text-neon-green hover:bg-neon-green/10'
                    )}
                    style={{
                      textShadow: language === 'en' ? 'none' : '0 0 8px currentColor'
                    }}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage('es')}
                    className={cn(
                      'px-3 py-1 text-xs font-ui font-bold uppercase transition-all duration-200',
                      language === 'es'
                        ? 'bg-neon-green text-black'
                        : 'text-neon-green hover:bg-neon-green/10'
                    )}
                    style={{
                      textShadow: language === 'es' ? 'none' : '0 0 8px currentColor'
                    }}
                  >
                    ES
                  </button>
                </div>
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className={cn(
                    'p-2 rounded border-2 border-neon-green/50',
                    'text-neon-green hover:bg-neon-green/10 hover:border-neon-green',
                    'transition-all duration-200'
                  )}
                  style={{
                    textShadow: '0 0 10px currentColor',
                    boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Animated underline */}
            <div
              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-neon-green to-transparent"
              style={{
                width: '100%',
                animation: 'scanline 2s linear infinite'
              }}
            />
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-cyan">
            {/* Grid pattern background */}
            <div
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(0deg, transparent 24%, rgba(0, 255, 255, 0.3) 25%, rgba(0, 255, 255, 0.3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.3) 75%, rgba(0, 255, 255, 0.3) 76%, transparent 77%, transparent),
                  linear-gradient(90deg, transparent 24%, rgba(0, 255, 255, 0.3) 25%, rgba(0, 255, 255, 0.3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.3) 75%, rgba(0, 255, 255, 0.3) 76%, transparent 77%, transparent)
                `,
                backgroundSize: '50px 50px'
              }}
            />

            {/* Content sections with glowing boxes */}
            <div className="relative space-y-4">
              {/* Welcome section */}
              <div
                className="border-2 border-neon-green/50 rounded p-4 bg-black/30"
                style={{
                  boxShadow: '0 0 10px rgba(0, 255, 65, 0.2), inset 0 0 20px rgba(0, 255, 65, 0.05)'
                }}
              >
                <p className="text-sm font-mono-retro text-neon-green/70 leading-relaxed text-center">
                  {language === 'en'
                    ? 'Real-time audio visualization experience. Your music transforms into visual patterns that dance with every beat.'
                    : 'Experiencia de visualización de audio en tiempo real. Tu música se transforma en patrones visuales que danzan con cada beat.'}
                </p>
              </div>

              {/* Tech stack section */}
              <div
                className="border-2 border-neon-green/50 rounded p-4 bg-black/30"
                style={{
                  boxShadow: '0 0 10px rgba(0, 255, 65, 0.2), inset 0 0 20px rgba(0, 255, 65, 0.05)'
                }}
              >
                <h3
                  className="text-lg font-ui font-bold text-neon-green mb-2 uppercase"
                  style={{
                    textShadow: '0 0 10px currentColor'
                  }}
                >
                  ◆ Technology Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Next.js 15', 'React 19', 'TypeScript', 'Canvas 2D', 'Web Audio API', 'Zustand', 'Tailwind CSS'].map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 text-xs font-mono-retro border border-neon-green/50 rounded text-neon-green"
                      style={{
                        boxShadow: '0 0 5px rgba(0, 255, 65, 0.3)'
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Developer info */}
              <div
                className="border-2 border-neon-green/50 rounded p-4 bg-black/30"
                style={{
                  boxShadow: '0 0 10px rgba(0, 255, 65, 0.2), inset 0 0 20px rgba(0, 255, 65, 0.05)'
                }}
              >
                <h3
                  className="text-lg font-ui font-bold text-neon-green mb-2 uppercase text-center"
                  style={{
                    textShadow: '0 0 10px currentColor'
                  }}
                >
                  ◆ {language === 'en' ? 'Developed by' : 'Desarrollado por'}
                </h3>
                <p className="text-sm font-mono-retro text-neon-green/70 text-center mb-2">
                  Jaime Villegas
                </p>
                <div className="text-center">
                  <a
                    href="https://jvdevsolutions.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 border-2 border-neon-green/50 rounded text-neon-green hover:bg-neon-green/10 hover:border-neon-green transition-all duration-200 font-mono-retro text-sm"
                    style={{
                      textShadow: '0 0 8px currentColor',
                      boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)'
                    }}
                  >
                    jvdevsolutions.com
                  </a>
                </div>
              </div>

              {/* Version info */}
              <div className="text-center pt-4 border-t-2 border-neon-green/30">
                <p className="text-xs font-mono-retro text-neon-green/60 tracking-wider">
                  AURA VISUALS v1.0.0 // SYSTEM OPERATIONAL // ALL FREQUENCIES NOMINAL
                </p>
                <p className="text-xs font-mono-retro text-neon-green/40 mt-1">
                  © 2025 // DESIGNED FOR THE DIGITAL FUTURE
                </p>
              </div>
            </div>
          </div>

          {/* Scanline overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes borderGlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes scanline {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100px); opacity: 0; }
        }

        /* TV Turn On Animation - From center outwards */
        @keyframes tvOn {
          0% {
            transform: scaleX(0) scaleY(0.001);
            opacity: 0;
            filter: brightness(3);
          }
          30% {
            transform: scaleX(0.3) scaleY(0.001);
            filter: brightness(2);
          }
          50% {
            transform: scaleX(0.6) scaleY(0.3);
            opacity: 1;
            filter: brightness(1.5);
          }
          70% {
            transform: scaleX(0.9) scaleY(0.7);
          }
          85% {
            transform: scaleX(1.02) scaleY(1.02);
            filter: brightness(1.2);
          }
          100% {
            transform: scaleX(1) scaleY(1);
            opacity: 1;
            filter: brightness(1);
          }
        }

        /* TV Turn Off Animation - Collapse to center line */
        @keyframes tvOff {
          0% {
            transform: scaleX(1) scaleY(1);
            opacity: 1;
            filter: brightness(1);
          }
          15% {
            transform: scaleX(1.01) scaleY(1.01);
            filter: brightness(1.5);
          }
          40% {
            transform: scaleX(0.8) scaleY(0.5);
            filter: brightness(2);
          }
          70% {
            transform: scaleX(0.3) scaleY(0.05);
            opacity: 0.8;
            filter: brightness(3);
          }
          100% {
            transform: scaleX(0) scaleY(0.001);
            opacity: 0;
            filter: brightness(5);
          }
        }
      `}</style>
    </div>
  )
}
