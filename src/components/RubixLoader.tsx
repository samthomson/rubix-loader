import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface RubixLoaderProps {
  className?: string;
  size?: number;
}

const RubixLoader = ({ className, size = 200 }: RubixLoaderProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let animationFrame: number;
    let time = 0;

    // Cube state
    const cubeSize = size * 0.6;
    const pieceSize = cubeSize / 3;
    const gap = 4;

    // Rotation angles
    let rotX = -0.5;
    let rotY = 0.8;

    // Animation state for solving effect
    const pieces: Array<{
      x: number;
      y: number;
      z: number;
      rotX: number;
      rotY: number;
      rotZ: number;
      rotSpeed: number;
      rotAxis: number;
    }> = [];

    // Initialize 26 pieces (3x3x3 minus center)
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          if (x === 1 && y === 1 && z === 1) continue; // Skip center
          pieces.push({
            x: (x - 1) * (pieceSize + gap),
            y: (y - 1) * (pieceSize + gap),
            z: (z - 1) * (pieceSize + gap),
            rotX: 0,
            rotY: 0,
            rotZ: 0,
            rotSpeed: 0.02 + Math.random() * 0.01,
            rotAxis: Math.floor(Math.random() * 3), // 0=X, 1=Y, 2=Z
          });
        }
      }
    }

    // Simple 3D projection
    const project = (x: number, y: number, z: number) => {
      // Apply piece rotation first
      const perspective = 600;
      const scale = perspective / (perspective + z);
      return {
        x: x * scale + size / 2,
        y: y * scale + size / 2,
        scale,
      };
    };

    const rotateX = (y: number, z: number, angle: number) => ({
      y: y * Math.cos(angle) - z * Math.sin(angle),
      z: y * Math.sin(angle) + z * Math.cos(angle),
    });

    const rotateY = (x: number, z: number, angle: number) => ({
      x: x * Math.cos(angle) + z * Math.sin(angle),
      z: -x * Math.sin(angle) + z * Math.cos(angle),
    });

    const rotateZ = (x: number, y: number, angle: number) => ({
      x: x * Math.cos(angle) - y * Math.sin(angle),
      y: x * Math.sin(angle) + y * Math.cos(angle),
    });

    const drawCubeFace = (corners: Array<{ x: number; y: number; scale: number }>, color: string) => {
      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      for (let i = 1; i < corners.length; i++) {
        ctx.lineTo(corners[i].x, corners[i].y);
      }
      ctx.closePath();
      
      const avgScale = corners.reduce((sum, c) => sum + c.scale, 0) / corners.length;
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 * avgScale})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, size, size);
      
      time += 0.01;
      rotY += 0.005;

      // Sort pieces by depth for proper rendering
      const sortedPieces = pieces.map((piece, idx) => {
        // Apply piece animation
        if (piece.rotAxis === 0) piece.rotX += piece.rotSpeed;
        else if (piece.rotAxis === 1) piece.rotY += piece.rotSpeed;
        else piece.rotZ += piece.rotSpeed;

        // Reset rotation periodically
        if (piece.rotX > Math.PI * 2) piece.rotX = 0;
        if (piece.rotY > Math.PI * 2) piece.rotY = 0;
        if (piece.rotZ > Math.PI * 2) piece.rotZ = 0;

        let x = piece.x, y = piece.y, z = piece.z;
        
        // Apply piece rotation
        if (piece.rotX !== 0) {
          const r = rotateX(y, z, piece.rotX);
          y = r.y;
          z = r.z;
        }
        if (piece.rotY !== 0) {
          const r = rotateY(x, z, piece.rotY);
          x = r.x;
          z = r.z;
        }
        if (piece.rotZ !== 0) {
          const r = rotateZ(x, y, piece.rotZ);
          x = r.x;
          y = r.y;
        }

        // Apply global rotation
        const r1 = rotateX(y, z, rotX);
        y = r1.y;
        z = r1.z;
        const r2 = rotateY(x, z, rotY);
        x = r2.x;
        z = r2.z;

        return { piece, x, y, z, idx };
      }).sort((a, b) => a.z - b.z);

      // Draw each piece
      sortedPieces.forEach(({ piece, x, y, z }) => {
        const half = pieceSize / 2;

        // Define 8 corners of the cube
        const corners = [
          { lx: -half, ly: -half, lz: -half },
          { lx: half, ly: -half, lz: -half },
          { lx: half, ly: half, lz: -half },
          { lx: -half, ly: half, lz: -half },
          { lx: -half, ly: -half, lz: half },
          { lx: half, ly: -half, lz: half },
          { lx: half, ly: half, lz: half },
          { lx: -half, ly: half, lz: half },
        ].map(c => {
          let px = c.lx, py = c.ly, pz = c.lz;
          
          // Apply piece rotation
          if (piece.rotX !== 0) {
            const r = rotateX(py, pz, piece.rotX);
            py = r.y;
            pz = r.z;
          }
          if (piece.rotY !== 0) {
            const r = rotateY(px, pz, piece.rotY);
            px = r.x;
            pz = r.z;
          }
          if (piece.rotZ !== 0) {
            const r = rotateZ(px, py, piece.rotZ);
            px = r.x;
            py = r.y;
          }

          // Add piece position
          px += x;
          py += y;
          pz += z;

          return project(px, py, pz);
        });

        // Draw visible faces with pink tints
        const colors = [
          'rgba(255, 182, 193, 0.4)',
          'rgba(255, 192, 203, 0.4)',
          'rgba(255, 218, 224, 0.4)',
          'rgba(255, 200, 221, 0.4)',
          'rgba(255, 210, 210, 0.4)',
          'rgba(255, 228, 225, 0.4)',
        ];

        // Front face
        drawCubeFace([corners[4], corners[5], corners[6], corners[7]], colors[0]);
        // Back face
        drawCubeFace([corners[0], corners[3], corners[2], corners[1]], colors[1]);
        // Right face
        drawCubeFace([corners[1], corners[2], corners[6], corners[5]], colors[2]);
        // Left face
        drawCubeFace([corners[0], corners[4], corners[7], corners[3]], colors[3]);
        // Top face
        drawCubeFace([corners[3], corners[7], corners[6], corners[2]], colors[4]);
        // Bottom face
        drawCubeFace([corners[0], corners[1], corners[5], corners[4]], colors[5]);
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [size]);

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="will-change-transform"
      />
    </div>
  );
};

export default RubixLoader;
