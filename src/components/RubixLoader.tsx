import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface RubixLoaderProps {
  className?: string;
  size?: number;
}

const RubixLoader = ({ className, size = 120 }: RubixLoaderProps) => {
  const cubeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cubeRef.current) return;

    // Animate cube rotation
    let rotationX = -25;
    let rotationY = 45;
    let animationFrame: number;

    const animate = () => {
      rotationY += 0.5;
      if (cubeRef.current) {
        cubeRef.current.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
      }
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  // Generate cube pieces (3x3x3 = 27 pieces, but we'll show outer 26 for visibility)
  const generateCubePieces = () => {
    const pieces = [];
    const gap = 2;
    const pieceSize = (size - gap * 2) / 3;

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          // Skip the center piece (it's not visible in a real Rubik's cube)
          if (x === 1 && y === 1 && z === 1) continue;

          const translateX = (x - 1) * (pieceSize + gap);
          const translateY = (y - 1) * (pieceSize + gap);
          const translateZ = (z - 1) * (pieceSize + gap);

          // Assign colors based on position (pinky-purple shades)
          const colors = {
            front: 'rgba(219, 112, 147, 0.4)', // pale violet red
            back: 'rgba(186, 85, 211, 0.4)', // medium orchid
            right: 'rgba(221, 160, 221, 0.4)', // plum
            left: 'rgba(218, 112, 214, 0.4)', // orchid
            top: 'rgba(238, 130, 238, 0.4)', // violet
            bottom: 'rgba(216, 191, 216, 0.4)', // thistle
          };

          pieces.push(
            <div
              key={`${x}-${y}-${z}`}
              className="cube-piece absolute"
              style={{
                width: pieceSize,
                height: pieceSize,
                transformStyle: 'preserve-3d',
                transform: `translate3d(${translateX}px, ${translateY}px, ${translateZ}px)`,
                animation: `solving ${2 + Math.random() * 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              {/* Front face */}
              <div
                className="cube-face absolute w-full h-full border border-white/20 backdrop-blur-sm"
                style={{
                  background: `linear-gradient(135deg, ${colors.front}, rgba(255, 255, 255, 0.1))`,
                  transform: `translateZ(${pieceSize / 2}px)`,
                  boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.3)',
                }}
              />
              {/* Back face */}
              <div
                className="cube-face absolute w-full h-full border border-white/20 backdrop-blur-sm"
                style={{
                  background: `linear-gradient(135deg, ${colors.back}, rgba(255, 255, 255, 0.1))`,
                  transform: `translateZ(${-pieceSize / 2}px) rotateY(180deg)`,
                  boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.3)',
                }}
              />
              {/* Right face */}
              <div
                className="cube-face absolute w-full h-full border border-white/20 backdrop-blur-sm"
                style={{
                  background: `linear-gradient(135deg, ${colors.right}, rgba(255, 255, 255, 0.1))`,
                  transform: `rotateY(90deg) translateZ(${pieceSize / 2}px)`,
                  boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.3)',
                }}
              />
              {/* Left face */}
              <div
                className="cube-face absolute w-full h-full border border-white/20 backdrop-blur-sm"
                style={{
                  background: `linear-gradient(135deg, ${colors.left}, rgba(255, 255, 255, 0.1))`,
                  transform: `rotateY(-90deg) translateZ(${pieceSize / 2}px)`,
                  boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.3)',
                }}
              />
              {/* Top face */}
              <div
                className="cube-face absolute w-full h-full border border-white/20 backdrop-blur-sm"
                style={{
                  background: `linear-gradient(135deg, ${colors.top}, rgba(255, 255, 255, 0.1))`,
                  transform: `rotateX(90deg) translateZ(${pieceSize / 2}px)`,
                  boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.3)',
                }}
              />
              {/* Bottom face */}
              <div
                className="cube-face absolute w-full h-full border border-white/20 backdrop-blur-sm"
                style={{
                  background: `linear-gradient(135deg, ${colors.bottom}, rgba(255, 255, 255, 0.1))`,
                  transform: `rotateX(-90deg) translateZ(${pieceSize / 2}px)`,
                  boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.3)',
                }}
              />
            </div>
          );
        }
      }
    }

    return pieces;
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <style>{`
        @keyframes solving {
          0%, 100% {
            transform: translate3d(var(--tx), var(--ty), var(--tz)) rotateX(0deg) rotateY(0deg);
          }
          25% {
            transform: translate3d(var(--tx), var(--ty), var(--tz)) rotateX(90deg) rotateY(0deg);
          }
          50% {
            transform: translate3d(var(--tx), var(--ty), var(--tz)) rotateX(90deg) rotateY(90deg);
          }
          75% {
            transform: translate3d(var(--tx), var(--ty), var(--tz)) rotateX(0deg) rotateY(90deg);
          }
        }

        .cube-piece {
          --tx: 0px;
          --ty: 0px;
          --tz: 0px;
        }

        .cube-face {
          backface-visibility: hidden;
        }
      `}</style>

      <div
        className="relative"
        style={{
          width: size,
          height: size,
          perspective: '1000px',
        }}
      >
        <div
          ref={cubeRef}
          className="relative w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'rotateX(-25deg) rotateY(45deg)',
          }}
        >
          {generateCubePieces()}
        </div>
      </div>
    </div>
  );
};

export default RubixLoader;
