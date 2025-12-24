import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface RubixLoaderProps {
  className?: string;
  size?: number;
}

// Define color palette with more vibrant pink/purple shades
const COLORS = [
  { base: 'rgba(255, 182, 255, 0.8)', glow: 'rgba(255, 182, 255, 0.3)' }, // bright pink
  { base: 'rgba(230, 190, 255, 0.8)', glow: 'rgba(230, 190, 255, 0.3)' }, // light purple
  { base: 'rgba(255, 200, 230, 0.8)', glow: 'rgba(255, 200, 230, 0.3)' }, // pink
  { base: 'rgba(240, 200, 255, 0.8)', glow: 'rgba(240, 200, 255, 0.3)' }, // lavender
  { base: 'rgba(255, 220, 255, 0.8)', glow: 'rgba(255, 220, 255, 0.3)' }, // light pink
  { base: 'rgba(250, 210, 255, 0.8)', glow: 'rgba(250, 210, 255, 0.3)' }, // pale purple
];

interface Cubelet {
  // Current grid position
  gridX: number;
  gridY: number;
  gridZ: number;
  // Colors for each face: [front, back, right, left, top, bottom]
  faceColors: number[]; // indices into COLORS array
}

const RubixLoader = ({ className, size = 400 }: RubixLoaderProps) => {
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

    const cubeSize = size * 0.5; // Reduced from 0.7 to leave room for rotation
    const pieceSize = cubeSize / 3;
    const gap = 3;

    // Global rotation
    let globalRotX = -0.6;
    let globalRotY = 0.785;

    // Animation state
    let activeRotation: {
      axis: 'x' | 'y' | 'z';
      layerIndex: 0 | 1 | 2;
      currentAngle: number;
      targetAngle: number;
    } | null = null;

    // Initialize cubelets with their colors
    const cubelets: Cubelet[] = [];

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          if (x === 1 && y === 1 && z === 1) continue; // Skip center

          // Assign random colors to each face
          cubelets.push({
            gridX: x,
            gridY: y,
            gridZ: z,
            faceColors: [
              Math.floor(Math.random() * COLORS.length),
              Math.floor(Math.random() * COLORS.length),
              Math.floor(Math.random() * COLORS.length),
              Math.floor(Math.random() * COLORS.length),
              Math.floor(Math.random() * COLORS.length),
              Math.floor(Math.random() * COLORS.length),
            ],
          });
        }
      }
    }

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
      return {
        x: x + size / 2,
        y: y + size / 2,
        z: z,
      };
    };

    const drawQuad = (corners: Array<{x: number, y: number}>, colorIdx: number, alpha: number) => {
      const color = COLORS[colorIdx];

      // Create gradient for glisten effect
      const centerX = corners.reduce((sum, c) => sum + c.x, 0) / 4;
      const centerY = corners.reduce((sum, c) => sum + c.y, 0) / 4;
      const maxDist = Math.max(
        ...corners.map(c => Math.sqrt((c.x - centerX) ** 2 + (c.y - centerY) ** 2))
      );

      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, maxDist
      );

      const baseColor = color.base.replace(/[\d.]+\)$/, `${alpha})`);
      const glowColor = color.glow.replace(/[\d.]+\)$/, `${alpha * 1.2})`);

      gradient.addColorStop(0, glowColor);
      gradient.addColorStop(1, baseColor);

      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      ctx.lineTo(corners[1].x, corners[1].y);
      ctx.lineTo(corners[2].x, corners[2].y);
      ctx.lineTo(corners[3].x, corners[3].y);
      ctx.closePath();

      ctx.fillStyle = gradient;
      ctx.fill();

      // Add shiny border
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, size, size);

      globalRotY += 0.005;

      // Update active rotation
      if (activeRotation) {
        activeRotation.currentAngle += 0.08;

        if (activeRotation.currentAngle >= activeRotation.targetAngle) {
          // Complete the rotation - update grid positions
          const affectedCubelets = cubelets.filter(c => {
            if (activeRotation!.axis === 'x') return c.gridX === activeRotation!.layerIndex;
            if (activeRotation!.axis === 'y') return c.gridY === activeRotation!.layerIndex;
            return c.gridZ === activeRotation!.layerIndex;
          });

          affectedCubelets.forEach(cubelet => {
            const { gridX, gridY, gridZ } = cubelet;

            if (activeRotation!.axis === 'x') {
              // Rotate in YZ plane
              cubelet.gridY = 2 - gridZ;
              cubelet.gridZ = gridY;
              // Rotate face colors: front->top->back->bottom->front, left/right swap
              const [f, b, r, l, t, bo] = cubelet.faceColors;
              cubelet.faceColors = [t, bo, l, r, b, f];
            } else if (activeRotation!.axis === 'y') {
              // Rotate in XZ plane
              cubelet.gridX = gridZ;
              cubelet.gridZ = 2 - gridX;
              // Rotate face colors: front->right->back->left->front, top/bottom stay
              const [f, b, r, l, t, bo] = cubelet.faceColors;
              cubelet.faceColors = [l, r, f, b, t, bo];
            } else {
              // Rotate in XY plane
              cubelet.gridX = 2 - gridY;
              cubelet.gridY = gridX;
              // Rotate face colors: top->right->bottom->left->top, front/back stay
              const [f, b, r, l, t, bo] = cubelet.faceColors;
              cubelet.faceColors = [f, b, t, bo, l, r];
            }
          });

          activeRotation = null;
          setTimeout(startRotation, 400);
        }
      }

      // Build face list
      const faces: Array<{
        corners: Array<{x: number, y: number}>,
        colorIdx: number,
        alpha: number,
        avgZ: number,
      }> = [];

      cubelets.forEach(cubelet => {
        const { gridX, gridY, gridZ, faceColors } = cubelet;

        // Position in world space
        const baseX = (gridX - 1) * (pieceSize + gap);
        const baseY = (gridY - 1) * (pieceSize + gap);
        const baseZ = (gridZ - 1) * (pieceSize + gap);

        const half = pieceSize / 2;

        // 8 corners
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

        // Apply layer rotation
        let layerRotX = 0, layerRotY = 0, layerRotZ = 0;

        if (activeRotation) {
          let isInLayer = false;

          if (activeRotation.axis === 'x' && gridX === activeRotation.layerIndex) {
            isInLayer = true;
            layerRotX = activeRotation.currentAngle;
          } else if (activeRotation.axis === 'y' && gridY === activeRotation.layerIndex) {
            isInLayer = true;
            layerRotY = activeRotation.currentAngle;
          } else if (activeRotation.axis === 'z' && gridZ === activeRotation.layerIndex) {
            isInLayer = true;
            layerRotZ = activeRotation.currentAngle;
          }

          if (isInLayer) {
            for (let i = 0; i < corners3d.length; i++) {
              const c = corners3d[i];
              const rotated = rotatePoint(c.x, c.y, c.z, layerRotX, layerRotY, layerRotZ);
              corners3d[i] = rotated;
            }
          }
        }

        // Apply global rotation
        const rotatedCorners = corners3d.map(c =>
          rotatePoint(c.x, c.y, c.z, globalRotX, globalRotY, 0)
        );

        // Project to 2D
        const projected = rotatedCorners.map(c => project(c.x, c.y, c.z));

        // Define faces with their color indices
        const faceIndices = [
          [4, 5, 6, 7], // front
          [0, 3, 2, 1], // back
          [1, 2, 6, 5], // right
          [0, 4, 7, 3], // left
          [3, 7, 6, 2], // top
          [0, 1, 5, 4], // bottom
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
            const alpha = Math.max(0.6, Math.min(1, 1 - avgZ / 600));

            faces.push({
              corners: faceCorners,
              colorIdx: faceColors[faceIdx],
              alpha,
              avgZ,
            });
          }
        });
      });

      // Sort and draw
      faces.sort((a, b) => a.avgZ - b.avgZ);
      faces.forEach(face => {
        drawQuad(face.corners, face.colorIdx, face.alpha);
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
