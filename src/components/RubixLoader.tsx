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

    // Cube state
    const cubeSize = size * 0.6;
    const pieceSize = cubeSize / 3;

    // Global rotation
    let rotX = -0.6;
    let rotY = 0.785;

    // Active move state
    let currentMove: {
      axis: 'x' | 'y' | 'z';
      layer: number; // -1, 0, 1
      angle: number;
      targetAngle: number;
      speed: number;
    } | null = null;

    // Track which pieces belong to which position (3x3x3 grid)
    const grid: Array<Array<Array<number>>> = [];
    for (let x = 0; x < 3; x++) {
      grid[x] = [];
      for (let y = 0; y < 3; y++) {
        grid[x][y] = [];
        for (let z = 0; z < 3; z++) {
          grid[x][y][z] = x * 9 + y * 3 + z;
        }
      }
    }

    // Start a new random move
    const startNewMove = () => {
      const axes: Array<'x' | 'y' | 'z'> = ['x', 'y', 'z'];
      const layers = [0, 1, 2]; // Front, middle, back layer
      
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
      const perspective = 800;
      const scale = perspective / (perspective + z);
      return {
        x: x * scale + size / 2,
        y: y * scale + size / 2,
        scale,
        z,
      };
    };

    const drawCubeFace = (corners: Array<{ x: number; y: number }>, color: string, brightness: number) => {
      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      for (let i = 1; i < corners.length; i++) {
        ctx.lineTo(corners[i].x, corners[i].y);
      }
      ctx.closePath();
      
      const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      if (match) {
        const [, r, g, b, a] = match;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${parseFloat(a) * brightness})`;
      } else {
        ctx.fillStyle = color;
      }
      ctx.fill();
      
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 * brightness})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, size, size);
      
      rotY += 0.005;

      // Update current move
      if (currentMove) {
        currentMove.angle += currentMove.speed;
        
        if (currentMove.angle >= currentMove.targetAngle) {
          // Rotate the grid layer
          const layer = currentMove.layer;
          const newGrid: Array<Array<Array<number>>> = JSON.parse(JSON.stringify(grid));
          
          if (currentMove.axis === 'x') {
            // Rotate YZ plane at x=layer
            for (let y = 0; y < 3; y++) {
              for (let z = 0; z < 3; z++) {
                // 90 degree clockwise: (y,z) -> (z, 2-y)
                newGrid[layer][2 - z][y] = grid[layer][y][z];
              }
            }
          } else if (currentMove.axis === 'y') {
            // Rotate XZ plane at y=layer
            for (let x = 0; x < 3; x++) {
              for (let z = 0; z < 3; z++) {
                // 90 degree clockwise: (x,z) -> (2-z, x)
                newGrid[2 - z][layer][x] = grid[x][layer][z];
              }
            }
          } else {
            // Rotate XY plane at z=layer
            for (let x = 0; x < 3; x++) {
              for (let y = 0; y < 3; y++) {
                // 90 degree clockwise: (x,y) -> (y, 2-x)
                newGrid[y][2 - x][layer] = grid[x][y][layer];
              }
            }
          }
          
          // Copy new grid
          for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
              for (let z = 0; z < 3; z++) {
                grid[x][y][z] = newGrid[x][y][z];
              }
            }
          }
          
          currentMove = null;
          setTimeout(startNewMove, 300);
        }
      }

      // Draw the entire cube as one solid object
      // Calculate all piece positions
      const pieces: Array<{
        gridX: number;
        gridY: number;
        gridZ: number;
        worldX: number;
        worldY: number;
        worldZ: number;
        id: number;
      }> = [];

      for (let gx = 0; gx < 3; gx++) {
        for (let gy = 0; gy < 3; gy++) {
          for (let gz = 0; gz < 3; gz++) {
            if (gx === 1 && gy === 1 && gz === 1) continue; // Skip center

            // Base position in world space
            let x = (gx - 1) * pieceSize;
            let y = (gy - 1) * pieceSize;
            let z = (gz - 1) * pieceSize;

            // Apply current move rotation if this piece is affected
            if (currentMove) {
              const affectedByMove = 
                (currentMove.axis === 'x' && gx === currentMove.layer) ||
                (currentMove.axis === 'y' && gy === currentMove.layer) ||
                (currentMove.axis === 'z' && gz === currentMove.layer);

              if (affectedByMove) {
                // Rotate position around the axis
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

            pieces.push({
              gridX: gx,
              gridY: gy,
              gridZ: gz,
              worldX: x,
              worldY: y,
              worldZ: z,
              id: grid[gx][gy][gz],
            });
          }
        }
      }

      // Sort by depth
      pieces.sort((a, b) => a.worldZ - b.worldZ);

      // Face colors
      const faceColors = [
        'rgba(255, 182, 193, 0.5)',
        'rgba(255, 192, 203, 0.5)',
        'rgba(255, 218, 224, 0.5)',
        'rgba(255, 200, 221, 0.5)',
        'rgba(255, 210, 210, 0.5)',
        'rgba(255, 228, 225, 0.5)',
      ];

      // Draw each piece as part of the whole cube
      pieces.forEach((piece) => {
        const half = pieceSize / 2;
        const { worldX: cx, worldY: cy, worldZ: cz } = piece;

        // Define the 8 corners relative to piece center
        const localCorners = [
          { x: -half, y: -half, z: -half },
          { x: half, y: -half, z: -half },
          { x: half, y: half, z: -half },
          { x: -half, y: half, z: -half },
          { x: -half, y: -half, z: half },
          { x: half, y: -half, z: half },
          { x: half, y: half, z: half },
          { x: -half, y: half, z: half },
        ];

        const corners = localCorners.map(c => 
          project(c.x + cx, c.y + cy, c.z + cz)
        );

        // Calculate normal for backface culling
        const getNormal = (c1: typeof corners[0], c2: typeof corners[0], c3: typeof corners[0]) => {
          const dx1 = c2.x - c1.x, dy1 = c2.y - c1.y;
          const dx2 = c3.x - c1.x, dy2 = c3.y - c1.y;
          return dx1 * dy2 - dy1 * dx2;
        };

        // Draw visible faces
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
          
          if (normal > 0) {
            const avgZ = faceCorners.reduce((sum, c) => sum + c.z, 0) / 4;
            const brightness = Math.min(1, Math.max(0.5, 1 - avgZ / 400));
            drawCubeFace(faceCorners, face.color, brightness);
          }
        });
      });

      animationFrame = requestAnimationFrame(animate);
    };

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
