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

    // The whole cube rotates together, always as one unit
    let globalRotX = -0.6;
    let globalRotY = 0.785;

    // Animation state for layer turns
    let activeRotation: {
      axis: 'x' | 'y' | 'z';
      layerIndex: 0 | 1 | 2;
      currentAngle: number;
      targetAngle: number;
    } | null = null;

    const cubeSize = size * 0.55;
    const pieceSize = cubeSize / 3;
    const gap = 2;

    // Start a new layer rotation
    const startRotation = () => {
      const axes: Array<'x' | 'y' | 'z'> = ['x', 'y', 'z'];
      const layers: Array<0 | 1 | 2> = [0, 1, 2];

      activeRotation = {
        axis: axes[Math.floor(Math.random() * 3)],
        layerIndex: layers[Math.floor(Math.random() * 3)],
        currentAngle: 0,
        targetAngle: Math.PI / 2,
      };
    };

    // 3D math
    const rotatePoint = (x: number, y: number, z: number, rx: number, ry: number, rz: number) => {
      // Rotate around X
      let y1 = y * Math.cos(rx) - z * Math.sin(rx);
      let z1 = y * Math.sin(rx) + z * Math.cos(rx);

      // Rotate around Y
      let x2 = x * Math.cos(ry) + z1 * Math.sin(ry);
      let z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);

      // Rotate around Z
      let x3 = x2 * Math.cos(rz) - y1 * Math.sin(rz);
      let y3 = x2 * Math.sin(rz) + y1 * Math.cos(rz);

      return { x: x3, y: y3, z: z2 };
    };

    const project = (x: number, y: number, z: number) => {
      // Orthographic projection - no perspective distortion
      return {
        x: x + size / 2,
        y: y + size / 2,
        z: z,
      };
    };

    const drawQuad = (corners: Array<{x: number, y: number}>, color: string, alpha: number) => {
      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      ctx.lineTo(corners[1].x, corners[1].y);
      ctx.lineTo(corners[2].x, corners[2].y);
      ctx.lineTo(corners[3].x, corners[3].y);
      ctx.closePath();

      ctx.fillStyle = color.replace(/[\d.]+\)$/, `${alpha})`);
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, size, size);

      globalRotY += 0.005;

      // Update active rotation
      if (activeRotation) {
        activeRotation.currentAngle += 0.08;
        if (activeRotation.currentAngle >= activeRotation.targetAngle) {
          activeRotation = null;
          setTimeout(startRotation, 400);
        }
      }

      // Build list of all faces to draw
      const faces: Array<{
        corners: Array<{x: number, y: number}>,
        color: string,
        alpha: number,
        avgZ: number,
      }> = [];

      // Draw the cube as a 3x3x3 grid
      for (let ix = 0; ix < 3; ix++) {
        for (let iy = 0; iy < 3; iy++) {
          for (let iz = 0; iz < 3; iz++) {
            // Skip center piece
            if (ix === 1 && iy === 1 && iz === 1) continue;

            // Position in grid (centered at origin)
            const baseX = (ix - 1) * (pieceSize + gap);
            const baseY = (iy - 1) * (pieceSize + gap);
            const baseZ = (iz - 1) * (pieceSize + gap);

            const half = pieceSize / 2;

            // 8 corners of this cubelet
            const corners3d = [
              { x: baseX - half, y: baseY - half, z: baseZ - half },
              { x: baseX + half, y: baseY - half, z: baseZ - half },
              { x: baseX + half, y: baseY + half, z: baseZ - half },
              { x: baseX - half, y: baseY + half, z: baseZ - half },
              { x: baseX - half, y: baseY - half, z: baseZ + half },
              { x: baseX + half, y: baseY - half, z: baseZ + half },
              { x: baseX + half, y: baseY + half, z: baseZ + half },
              { x: baseX - half, y: baseY + half, z: baseZ + half },
            ];

            // Apply layer rotation if this piece is part of the rotating layer
            let layerRotX = 0, layerRotY = 0, layerRotZ = 0;

            if (activeRotation) {
              let isInLayer = false;

              if (activeRotation.axis === 'x' && ix === activeRotation.layerIndex) {
                isInLayer = true;
                layerRotX = activeRotation.currentAngle;
              } else if (activeRotation.axis === 'y' && iy === activeRotation.layerIndex) {
                isInLayer = true;
                layerRotY = activeRotation.currentAngle;
              } else if (activeRotation.axis === 'z' && iz === activeRotation.layerIndex) {
                isInLayer = true;
                layerRotZ = activeRotation.currentAngle;
              }

              if (isInLayer) {
                // Rotate all corners around the layer's axis
                for (let i = 0; i < corners3d.length; i++) {
                  const c = corners3d[i];
                  const rotated = rotatePoint(c.x, c.y, c.z, layerRotX, layerRotY, layerRotZ);
                  corners3d[i] = rotated;
                }
              }
            }

            // Apply global rotation to all corners
            const rotatedCorners = corners3d.map(c =>
              rotatePoint(c.x, c.y, c.z, globalRotX, globalRotY, 0)
            );

            // Project to 2D
            const projected = rotatedCorners.map(c => project(c.x, c.y, c.z));

            // Define 6 faces with their colors
            const faceIndices = [
              [4, 5, 6, 7], // front (z+)
              [0, 3, 2, 1], // back (z-)
              [1, 2, 6, 5], // right (x+)
              [0, 4, 7, 3], // left (x-)
              [3, 7, 6, 2], // top (y+)
              [0, 1, 5, 4], // bottom (y-)
            ];

            const faceColors = [
              'rgba(230, 230, 250, 0.5)', // lavender - light purple
              'rgba(255, 240, 245, 0.5)', // lavender blush - very light pink
              'rgba(245, 245, 245, 0.5)', // white smoke - light grey
              'rgba(248, 228, 245, 0.5)', // light pink with purple tint
              'rgba(240, 230, 255, 0.5)', // very light purple
              'rgba(250, 250, 250, 0.5)', // almost white
            ];

            faceIndices.forEach((indices, faceIdx) => {
              const faceCorners = indices.map(i => projected[i]);

              // Backface culling
              const v1x = faceCorners[1].x - faceCorners[0].x;
              const v1y = faceCorners[1].y - faceCorners[0].y;
              const v2x = faceCorners[2].x - faceCorners[0].x;
              const v2y = faceCorners[2].y - faceCorners[0].y;
              const cross = v1x * v2y - v1y * v2x;

              if (cross > 0) {
                const avgZ = faceCorners.reduce((sum, c) => sum + c.z, 0) / 4;
                const alpha = Math.max(0.3, Math.min(1, 1 - avgZ / 500));

                faces.push({
                  corners: faceCorners,
                  color: faceColors[faceIdx],
                  alpha,
                  avgZ,
                });
              }
            });
          }
        }
      }

      // Sort faces by depth and draw
      faces.sort((a, b) => a.avgZ - b.avgZ);
      faces.forEach(face => {
        drawQuad(face.corners, face.color, face.alpha);
      });

      animationFrame = requestAnimationFrame(animate);
    };

    setTimeout(startRotation, 500);
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
      />
    </div>
  );
};

export default RubixLoader;
