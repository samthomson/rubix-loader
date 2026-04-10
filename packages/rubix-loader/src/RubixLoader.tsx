import { memo, useEffect, useRef } from 'react';

export enum RubixLoaderColor {
  RelayKit = '#d2bef0',
  Strfry = '#facc15',
  NostrRs = '#ef4444',
  Blossom = '#ec4899',
  Nsite = '#111111',
}

export interface RubixLoaderProps {
  className?: string;
  size?: number;
  paused?: boolean;
  speed?: number;
  colors?: readonly string[];
}

const COLORS = [
  { base: 'rgba(210, 190, 240, 0.8)', glow: 'rgba(210, 190, 240, 0.4)' },
  { base: 'rgba(230, 215, 250, 0.8)', glow: 'rgba(230, 215, 250, 0.4)' },
  { base: 'rgba(195, 180, 235, 0.8)', glow: 'rgba(195, 180, 235, 0.4)' },
  { base: 'rgba(220, 205, 245, 0.8)', glow: 'rgba(220, 205, 245, 0.4)' },
  { base: 'rgba(180, 165, 225, 0.8)', glow: 'rgba(180, 165, 225, 0.4)' },
  { base: 'rgba(235, 225, 255, 0.8)', glow: 'rgba(235, 225, 255, 0.4)' },
  { base: 'rgba(200, 185, 245, 0.8)', glow: 'rgba(200, 185, 245, 0.4)' },
  { base: 'rgba(215, 200, 250, 0.8)', glow: 'rgba(215, 200, 250, 0.4)' },
];

const FACE_INDICES = [
  [4, 5, 6, 7],
  [0, 3, 2, 1],
  [1, 2, 6, 5],
  [0, 4, 7, 3],
  [3, 7, 6, 2],
  [0, 1, 5, 4],
] as const;

const parseColor = (input?: string): { r: number; g: number; b: number } | null => {
  if (!input) return null;
  const c = input.trim();

  const hex3 = /^#([0-9a-f]{3})$/i.exec(c);
  if (hex3) {
    const h = hex3[1];
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }

  const hex6 = /^#([0-9a-f]{6})$/i.exec(c);
  if (hex6) {
    const h = hex6[1];
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }

  const rgb =
    /^rgb\(\s*([01]?\d?\d|2[0-4]\d|25[0-5])\s*,\s*([01]?\d?\d|2[0-4]\d|25[0-5])\s*,\s*([01]?\d?\d|2[0-4]\d|25[0-5])\s*\)$/i.exec(
      c,
    );
  if (rgb) {
    return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]) };
  }

  return null;
};

const tint = (v: number, factor: number) => Math.max(0, Math.min(255, Math.round(v + (255 - v) * factor)));
const shade = (v: number, factor: number) => Math.max(0, Math.min(255, Math.round(v * factor)));

const buildPaletteFromColor = (input?: string) => {
  const rgb = parseColor(input);
  if (!rgb) return COLORS;

  const base = {
    r: tint(rgb.r, 0.55),
    g: tint(rgb.g, 0.55),
    b: tint(rgb.b, 0.55),
  };

  const factors = [
    { t: 0.02, a: 0.8 },
    { t: 0.16, a: 0.8 },
    { s: 0.82, a: 0.8 },
    { t: 0.28, a: 0.8 },
    { s: 0.9, a: 0.8 },
    { t: 0.4, a: 0.8 },
    { s: 0.74, a: 0.8 },
    { t: 0.52, a: 0.8 },
  ] as const;

  return factors.map((f) => {
    const r = 't' in f ? tint(base.r, f.t) : shade(base.r, f.s);
    const g = 't' in f ? tint(base.g, f.t) : shade(base.g, f.s);
    const b = 't' in f ? tint(base.b, f.t) : shade(base.b, f.s);
    return {
      base: `rgba(${r}, ${g}, ${b}, ${f.a})`,
      glow: `rgba(${r}, ${g}, ${b}, ${f.a * 0.5})`,
    };
  });
};

interface ParsedPaletteColor {
  r: number;
  g: number;
  b: number;
  baseA: number;
  glowA: number;
}

const parseRgba = (value: string) => {
  const m = /rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\s*\)/.exec(value);
  if (!m) return { r: 0, g: 0, b: 0, a: 0 };
  return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: Number(m[4]) };
};

const parsePalette = (palette: { base: string; glow: string }[]): ParsedPaletteColor[] =>
  palette.map((entry) => {
    const base = parseRgba(entry.base);
    const glow = parseRgba(entry.glow);
    return { r: base.r, g: base.g, b: base.b, baseA: base.a, glowA: glow.a };
  });

const buildPaletteFromParsed = (parsed: ParsedPaletteColor[]) =>
  parsed.map((entry) => ({
    base: `rgba(${entry.r}, ${entry.g}, ${entry.b}, ${entry.baseA})`,
    glow: `rgba(${entry.r}, ${entry.g}, ${entry.b}, ${entry.glowA})`,
  }));

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const COLOR_CYCLE_MS = 1300;

interface Cubelet {
  gridX: number;
  gridY: number;
  gridZ: number;
  faceColors: number[];
}

function RubixLoader({ className, size = 400, paused = false, speed: speedProp = 1, colors }: RubixLoaderProps) {
  const initialColor = colors && colors.length > 0 ? colors[0] : undefined;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const speedRef = useRef(speedProp);
  const paletteRef = useRef(buildPaletteFromColor(initialColor));
  const parsedPaletteRef = useRef(parsePalette(paletteRef.current));
  const paletteTransitionRef = useRef<{
    from: ParsedPaletteColor[];
    to: ParsedPaletteColor[];
    progress: number;
  } | null>(null);
  const cycleIndexRef = useRef(0);
  pausedRef.current = paused;
  speedRef.current = Math.max(0.05, speedProp);

  useEffect(() => {
    const setNextColor = (nextColor: string) => {
      const nextPalette = buildPaletteFromColor(nextColor);
      paletteTransitionRef.current = {
        from: parsedPaletteRef.current,
        to: parsePalette(nextPalette),
        progress: 0,
      };
    };

    const validColors = (colors ?? []).filter((value) => value.trim().length > 0);
    if (validColors.length > 0) {
      cycleIndexRef.current = 0;
      setNextColor(validColors[0]);

      if (validColors.length === 1) return;

      const interval = setInterval(() => {
        cycleIndexRef.current = (cycleIndexRef.current + 1) % validColors.length;
        setNextColor(validColors[cycleIndexRef.current]);
      }, COLOR_CYCLE_MS);

      return () => clearInterval(interval);
    }
  }, [colors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const activeColors = paletteRef.current;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let animationFrame = 0;
    let startRotationTimeout: ReturnType<typeof setTimeout> | null = null;

    const cubeSize = size * 0.5;
    const pieceSize = cubeSize / 3;
    const gap = Math.max(1, pieceSize * 0.06);

    let globalRotX = -0.6;
    let globalRotY = 0.785;
    let globalRotZ = 0;

    let activeRotation: {
      axis: 'x' | 'y' | 'z';
      layerIndex: 0 | 1 | 2;
      currentAngle: number;
      targetAngle: number;
    } | null = null;

    const cubelets: Cubelet[] = [];
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          if (x === 1 && y === 1 && z === 1) continue;
          cubelets.push({
            gridX: x,
            gridY: y,
            gridZ: z,
            faceColors: [
              Math.floor(Math.random() * activeColors.length),
              Math.floor(Math.random() * activeColors.length),
              Math.floor(Math.random() * activeColors.length),
              Math.floor(Math.random() * activeColors.length),
              Math.floor(Math.random() * activeColors.length),
              Math.floor(Math.random() * activeColors.length),
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
      const y1 = y * Math.cos(rx) - z * Math.sin(rx);
      const z1 = y * Math.sin(rx) + z * Math.cos(rx);
      const x2 = x * Math.cos(ry) + z1 * Math.sin(ry);
      const z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);
      const x3 = x2 * Math.cos(rz) - y1 * Math.sin(rz);
      const y3 = x2 * Math.sin(rz) + y1 * Math.cos(rz);
      return { x: x3, y: y3, z: z2 };
    };

    const project = (x: number, y: number, z: number) => ({ x: x + size / 2, y: y + size / 2, z });

    const drawQuad = (corners: Array<{ x: number; y: number }>, colorIdx: number, alpha: number) => {
      const color = paletteRef.current[colorIdx];
      const centerX = corners.reduce((sum, c) => sum + c.x, 0) / 4;
      const centerY = corners.reduce((sum, c) => sum + c.y, 0) / 4;
      const maxDist = Math.max(...corners.map((c) => Math.sqrt((c.x - centerX) ** 2 + (c.y - centerY) ** 2)));
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxDist);
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
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, size, size);

      if (!pausedRef.current) {
        const sp = speedRef.current;
        globalRotY += 0.0075 * sp;
        globalRotX = -0.6 + Math.sin(globalRotY * 0.35) * 0.22;
        globalRotZ += 0.0022 * sp;

        if (activeRotation) {
          activeRotation.currentAngle += 0.12 * sp;
          if (activeRotation.currentAngle >= activeRotation.targetAngle) {
            const affectedCubelets = cubelets.filter((c) => {
              if (activeRotation!.axis === 'x') return c.gridX === activeRotation!.layerIndex;
              if (activeRotation!.axis === 'y') return c.gridY === activeRotation!.layerIndex;
              return c.gridZ === activeRotation!.layerIndex;
            });

            affectedCubelets.forEach((cubelet) => {
              const { gridX, gridY, gridZ } = cubelet;
              if (activeRotation!.axis === 'x') {
                cubelet.gridY = 2 - gridZ;
                cubelet.gridZ = gridY;
                const [f, b, r, l, t, bo] = cubelet.faceColors;
                cubelet.faceColors = [t, bo, l, r, b, f];
              } else if (activeRotation!.axis === 'y') {
                cubelet.gridX = gridZ;
                cubelet.gridZ = 2 - gridX;
                const [f, b, r, l, t, bo] = cubelet.faceColors;
                cubelet.faceColors = [l, r, f, b, t, bo];
              } else {
                cubelet.gridX = 2 - gridY;
                cubelet.gridY = gridX;
                const [f, b, r, l, t, bo] = cubelet.faceColors;
                cubelet.faceColors = [f, b, t, bo, l, r];
              }
            });

            activeRotation = null;
            startRotationTimeout = setTimeout(startRotation, Math.max(16, 267 / sp));
          }
        }
      }

      if (paletteTransitionRef.current) {
        const transition = paletteTransitionRef.current;
        transition.progress = Math.min(1, transition.progress + 0.035);
        const blended = transition.from.map((fromColor, index) => {
          const toColor = transition.to[index];
          return {
            r: Math.round(lerp(fromColor.r, toColor.r, transition.progress)),
            g: Math.round(lerp(fromColor.g, toColor.g, transition.progress)),
            b: Math.round(lerp(fromColor.b, toColor.b, transition.progress)),
            baseA: lerp(fromColor.baseA, toColor.baseA, transition.progress),
            glowA: lerp(fromColor.glowA, toColor.glowA, transition.progress),
          };
        });

        parsedPaletteRef.current = blended;
        paletteRef.current = buildPaletteFromParsed(blended);
        if (transition.progress >= 1) paletteTransitionRef.current = null;
      }

      const faces: Array<{
        corners: Array<{ x: number; y: number }>;
        colorIdx: number;
        alpha: number;
        avgZ: number;
      }> = [];

      cubelets.forEach((cubelet) => {
        const { gridX, gridY, gridZ, faceColors } = cubelet;
        const baseX = (gridX - 1) * (pieceSize + gap);
        const baseY = (gridY - 1) * (pieceSize + gap);
        const baseZ = (gridZ - 1) * (pieceSize + gap);
        const half = pieceSize / 2;

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

        let layerRotX = 0;
        let layerRotY = 0;
        let layerRotZ = 0;
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
              corners3d[i] = rotatePoint(c.x, c.y, c.z, layerRotX, layerRotY, layerRotZ);
            }
          }
        }

        const rotatedCorners = corners3d.map((c) => rotatePoint(c.x, c.y, c.z, globalRotX, globalRotY, globalRotZ));
        const projected = rotatedCorners.map((c) => project(c.x, c.y, c.z));

        FACE_INDICES.forEach((indices, faceIdx) => {
          const faceCorners = indices.map((i) => projected[i]);
          const v1x = faceCorners[1].x - faceCorners[0].x;
          const v1y = faceCorners[1].y - faceCorners[0].y;
          const v2x = faceCorners[2].x - faceCorners[0].x;
          const v2y = faceCorners[2].y - faceCorners[0].y;
          const cross = v1x * v2y - v1y * v2x;
          if (cross > 0) {
            const avgZ = faceCorners.reduce((sum, c) => sum + c.z, 0) / 4;
            const alpha = Math.max(0.6, Math.min(1, 1 - avgZ / 600));
            faces.push({ corners: faceCorners, colorIdx: faceColors[faceIdx], alpha, avgZ });
          }
        });
      });

      faces.sort((a, b) => a.avgZ - b.avgZ);
      faces.forEach((face) => drawQuad(face.corners, face.colorIdx, face.alpha));
      animationFrame = requestAnimationFrame(animate);
    };

    startRotationTimeout = setTimeout(startRotation, 500);
    animate();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (startRotationTimeout) clearTimeout(startRotationTimeout);
    };
  }, [size]);

  const wrapperClassName = ['flex items-center justify-center', className].filter(Boolean).join(' ');

  return (
    <div className={wrapperClassName}>
      <canvas ref={canvasRef} style={{ width: size, height: size }} />
    </div>
  );
}

export default memo(RubixLoader);
