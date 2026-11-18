import React from 'react';

interface CelestialBackgroundProps {
  children?: React.ReactNode;
}

export const CelestialBackground: React.FC<CelestialBackgroundProps> = ({ children }) => {
  return (
    <div className="celestial-canvas-root" style={{ position: 'relative', width: '100%', minHeight: '100%', overflow: 'hidden' }}>
      {/* Deep Obsidian Background Layer */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse 90% 80% at 50% -15%, rgba(27, 28, 27, 0.45) 0%, rgba(18, 19, 19, 0.98) 75%, #080909 100%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Subtle Geometry Grid Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(48, 43, 32, 0.22) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(48, 43, 32, 0.22) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
          zIndex: 1,
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 95%)',
        }}
      />

      {/* Restrained Champagne Gold & Bronze Observatory Glow Blobs */}
      <div
        style={{
          position: 'fixed',
          top: '-10%',
          left: '20%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214, 184, 117, 0.04) 0%, rgba(214, 184, 117, 0) 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 1,
          animation: 'auroraDrift 18s ease-in-out infinite alternate',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: '20%',
          right: '15%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(143, 112, 68, 0.04) 0%, rgba(143, 112, 68, 0) 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 1,
          animation: 'auroraDrift 24s ease-in-out infinite alternate-reverse',
        }}
      />

      {/* Content Mount */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
};
