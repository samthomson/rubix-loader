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
    const gap = 3;

    // Rotation angles
    let rotX = -0.5;
    let rotY = 0.8;

    // Active move state
    let currentMove: {
      axis: 'x' | 'y' | 'z';
      layer: number; // -1, 0, 1
      angle: number;
      targetAngle: number;
      speed: number;
    } | null = null;

    // Piece positions (3x3x3 minus center)
    const pieces: Array<{
      x: number;
      y: number;
      z: number;
      gridX: number;
      gridY: number;
      gridZ: number;
    }> = [];

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          if (x === 1 && y === 1 && z === 1) continue; // Skip center
          pieces.push({
            x: x - 1,
            y: y - 1,
            z: z - 1,
            gridX: x - 1,
            gridY: y - 1,
            gridZ: z - 1,
          });
        }
      }
    }

    // Start a new random move
    const startNewMove = () => {
      const axes: Array<'x' | 'y' | 'z'> = ['x', 'y', 'z'];
      const layers = [-1, 0, 1];
      
      currentMove = {
        axis: axes[Math.floor(Math.random() * 3)],
        layer: layers[Math.floor(Math.random() * 3)],
        angle: 0,
        targetAngle: Math.PI / 2, // 90 degrees
        speed: 0.08,
      };
    };

    // 3D rotation helpers
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

    // Simple 3D projection
    const project = (x: number, y: number, z: number) => {
      const perspective = 600;
      const scale = perspective / (perspective + z);
      return {
        x: x * scale + size / 2,
        y: y * scale + size / 2,
        scale,
        z,
      };
    };

    const drawCubeFace = (corners: Array<{ x: number; y: number; scale: number }>, color: string, brightness: number) => {
      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      for (let i = 1; i < corners.length; i++) {
        ctx.lineTo(corners[i].x, corners[i].y);
      }
      ctx.closePath();
      
      // Parse rgba and adjust alpha based on brightness
      const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      if (match) {
        const [, r, g, b, a] = match;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${parseFloat(a) * brightness})`;
      } else {
        ctx.fillStyle = color;
      }
      ctx.fill();
      
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * brightness})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, size, size);
      
      time += 0.01;
      rotY += 0.005;

      // Update current move
      if (currentMove) {
        currentMove.angle += currentMove.speed;
        
        if (currentMove.angle >= currentMove.targetAngle) {
          // Snap pieces to new positions
          pieces.forEach(piece => {
            if (
              (currentMove!.axis === 'x' && piece.gridX === currentMove!.layer) ||
              (currentMove!.axis === 'y' && piece.gridY === currentMove!.layer) ||
              (currentMove!.axis === 'z' && piece.gridZ === currentMove!.layer)
            ) {
              // Apply the rotation to grid positions
              let gx = piece.gridX, gy = piece.gridY, gz = piece.gridZ;
              
              if (currentMove!.axis === 'x') {
                const r = rotateX(gy, gz, currentMove!.targetAngle);
                piece.gridY = Math.round(r.y);
                piece.gridZ = Math.round(r.z);
              } else if (currentMove!.axis === 'y') {
                const r = rotateY(gx, gz, currentMove!.targetAngle);
                piece.gridX = Math.round(r.x);
                piece.gridZ = Math.round(r.z);
              } else {
                const r = rotateZ(gx, gy, currentMove!.targetAngle);
                piece.gridX = Math.round(r.x);
                piece.gridY = Math.round(r.y);
              }
              
              piece.x = piece.gridX;
              piece.y = piece.gridY;
              piece.z = piece.gridZ;
            }
          });
          
          currentMove = null;
          setTimeout(startNewMove, 300);
        }
      }

      // Calculate positions with current move applied
      const positions = pieces.map(piece => {
        let x = piece.x * (pieceSize + gap);
        let y = piece.y * (pieceSize + gap);
        let z = piece.z * (pieceSize + gap);

        // Apply current move rotation
        if (currentMove) {
          const affectedByMove = 
            (currentMove.axis === 'x' && piece.gridX === currentMove.layer) ||
            (currentMove.axis === 'y' && piece.gridY === currentMove.layer) ||
            (currentMove.axis === 'z' && piece.gridZ === currentMove.layer);

          if (affectedByMove) {
            if (currentMove.axis === 'x') {
              const r = rotateX(y, z, currentMove.angle);
              y = r.y;
              z = r.z;
            } else if (currentMove.axis === 'y') {
              const r = rotateY(x, z, currentMove.angle);
              x = r.x;
              z = r.z;
            } else {
              const r = rotateZ(x, y, currentMove.angle);
              x = r.x;
              y = r.y;
            }
          }
        }

        // Apply global rotation
        let r1 = rotateX(y, z, rotX);
        y = r1.y;
        z = r1.z;
        let r2 = rotateY(x, z, rotY);
        x = r2.x;
        z = r2.z;

        return { piece, x, y, z };
      });

      // Sort by depth
      positions.sort((a, b) => a.z - b.z);

      // Draw each piece
      positions.forEach(({ x, y, z }) => {
        const half = pieceSize / 2;

        // Define 8 corners
        const localCorners = [
          { lx: -half, ly: -half, lz: -half },
          { lx: half, ly: -half, lz: -half },
          { lx: half, ly: half, lz: -half },
          { lx: -half, ly: half, lz: -half },
          { lx: -half, ly: -half, lz: half },
          { lx: half, ly: -half, lz: half },
          { lx: half, ly: half, lz: half },
          { lx: -half, ly: half, lz: half },
        ];

        const corners = localCorners.map(c => 
          project(c.lx + x, c.ly + y, c.lz + z)
        );

        // Face colors (subtle pinks)
        const faceColors = [
          'rgba(255, 182, 193, 0.6)', // light pink
          'rgba(255, 192, 203, 0.6)', // pink
          'rgba(255, 218, 224, 0.6)', // pale pink
          'rgba(255, 200, 221, 0.6)', // light pink
          'rgba(255, 210, 210, 0.6)', // pale pink
          'rgba(255, 228, 225, 0.6)', // misty rose
        ];

        // Calculate face normals for proper shading
        const getNormal = (c1: typeof corners[0], c2: typeof corners[0], c3: typeof corners[0]) => {
          const dx1 = c2.x - c1.x, dy1 = c2.y - c1.y, dz1 = c2.z - c1.z;
          const dx2 = c3.x - c1.x, dy2 = c3.y - c1.y, dz2 = c3.z - c1.z;
          return dx1 * dy2 - dy1 * dx2; // Simple 2D cross product for z component
        };

        // Draw faces (only if facing camera)
        const faces = [
          { indices: [4, 5, 6, 7], color: faceColors[0] }, // front
          { indices: [0, 3, 2, 1], color: faceColors[1] }, // back
          { indices: [1, 2, 6, 5], color: faceColors[2] }, // right
          { indices: [0, 4, 7, 3], color: faceColors[3] }, // left
          { indices: [3, 7, 6, 2], color: faceColors[4] }, // top
          { indices: [0, 1, 5, 4], color: faceColors[5] }, // bottom
        ];

        faces.forEach(face => {
          const faceCorners = face.indices.map(i => corners[i]);
          const normal = getNormal(faceCorners[0], faceCorners[1], faceCorners[2]);
          
          // Only draw if facing camera
          if (normal > 0) {
            const avgZ = faceCorners.reduce((sum, c) => sum + c.z, 0) / 4;
            const brightness = Math.min(1, Math.max(0.4, 1 - avgZ / 400));
            drawCubeFace(faceCorners, face.color, brightness);
          }
        });
      });

      animationFrame = requestAnimationFrame(animate);
    };

    // Start first move after a short delay
    setTimeout(startNewMove, 500);
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
