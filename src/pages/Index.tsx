import { useState } from 'react';
import RubixLoader from '@/components/RubixLoader';

interface LoaderExample {
  label: string;
  size: number;
  speed?: number;
  paused?: boolean;
  color?: string;
}

const EXAMPLES = [
  { label: 'Default', size: 180 },
  { label: 'Slow', size: 170, speed: 0.55, color: '#7c3aed' },
  { label: 'Fast', size: 170, speed: 1.8, color: '#06b6d4' },
  { label: 'Paused', size: 170, paused: true, color: '#f59e0b' },
  { label: 'Small', size: 120, speed: 1.1, color: 'rgb(34,197,94)' },
  { label: 'Large', size: 240, speed: 0.9, color: '#ef4444' },
] satisfies LoaderExample[];

const SIZE_EXAMPLES = [60, 80, 100, 120, 140, 180, 220, 280] as const;
const CYCLING_COLORS = ['#7c3aed', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#ec4899'] as const;

const Index = () => {
  const [playgroundSize, setPlaygroundSize] = useState(180);
  const [playgroundSpeed, setPlaygroundSpeed] = useState(1);
  const [playgroundPaused, setPlaygroundPaused] = useState(false);
  const [playgroundColor, setPlaygroundColor] = useState('#7c3aed');

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-center text-2xl font-semibold text-neutral-900">RubixLoader Prop Playground</h1>
        <p className="mb-8 text-center text-sm text-neutral-600">
          Compare `size`, `speed`, `paused`, and `color` at a glance.
        </p>

        <div className="mb-10 grid grid-cols-1 gap-6 rounded-xl border border-neutral-200 bg-neutral-50 p-5 lg:grid-cols-[1fr_360px]">
          <div className="flex items-center justify-center rounded-lg bg-white p-4">
            <RubixLoader
              size={playgroundSize}
              speed={playgroundSpeed}
              paused={playgroundPaused}
              colors={[playgroundColor]}
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-neutral-900">Interactive Controls</h2>

            <label className="block text-xs text-neutral-700">
              Size: {playgroundSize}
              <input
                className="mt-1 w-full"
                type="range"
                min={60}
                max={800}
                step={10}
                value={playgroundSize}
                onChange={(event) => setPlaygroundSize(Number(event.target.value))}
              />
            </label>

            <label className="block text-xs text-neutral-700">
              Speed: {playgroundSpeed.toFixed(2)}
              <input
                className="mt-1 w-full"
                type="range"
                min={0.1}
                max={2.5}
                step={0.05}
                value={playgroundSpeed}
                onChange={(event) => setPlaygroundSpeed(Number(event.target.value))}
              />
            </label>

            <label className="flex items-center gap-2 text-xs text-neutral-700">
              <input
                type="checkbox"
                checked={playgroundPaused}
                onChange={(event) => setPlaygroundPaused(event.target.checked)}
              />
              Paused
            </label>

            <div className="grid grid-cols-[44px_1fr] items-center gap-2 text-xs text-neutral-700">
              <input
                type="color"
                value={playgroundColor}
                onChange={(event) => setPlaygroundColor(event.target.value)}
                aria-label="Color picker"
              />
              <input
                className="rounded border border-neutral-300 px-2 py-1"
                value={playgroundColor}
                onChange={(event) => setPlaygroundColor(event.target.value)}
                placeholder="#7c3aed or rgb(124,58,237)"
              />
            </div>
          </div>
        </div>

        <h2 className="mb-3 text-sm font-semibold text-neutral-800">Live Color Cycling (No Reset)</h2>
        <div className="mb-10 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
          <div className="flex flex-col items-center gap-3">
            <RubixLoader size={220} speed={1} colors={CYCLING_COLORS} />
            <p className="text-xs text-neutral-600">
              internal colors cycle every 1.3s ({CYCLING_COLORS.join(' -> ')})
            </p>
          </div>
        </div>

        <h2 className="mb-3 text-sm font-semibold text-neutral-800">Size Variations</h2>
        <div className="mb-10 flex flex-wrap items-end justify-center gap-6 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
          {SIZE_EXAMPLES.map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <RubixLoader size={size} speed={1} colors={['#6366f1']} />
              <span className="text-xs text-neutral-600">size {size}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {EXAMPLES.map((example) => (
            <div
              key={example.label}
              className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 flex flex-col items-center gap-3"
            >
              <RubixLoader
                size={example.size}
                speed={example.speed}
                paused={example.paused}
                colors={example.color ? [example.color] : undefined}
              />
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-800">{example.label}</p>
                <p className="text-xs text-neutral-500">
                  size {example.size}
                  {example.speed ? ` • speed ${example.speed}` : ''}
                  {example.paused ? ' • paused' : ''}
                  {example.color ? ` • ${example.color}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
