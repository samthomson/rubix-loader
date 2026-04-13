import { useEffect, useState } from 'react';
import { RubixLoader } from '@samthomson/rubix-loader';
import { cn } from '@/lib/utils';

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

const SIZE_EXAMPLES = [24, 32, 40, 52, 64, 80, 100, 140, 220, 280] as const;
const CYCLING_COLORS = ['#7c3aed', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#ec4899'] as const;

/** Renders the same loader twice with isolated light / dark theme tokens (scoped `.dark`). */
function DualThemeSurface({
  renderContent,
  className,
}: {
  renderContent: () => React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-1 gap-3 md:grid-cols-2', className)}>
      <div className="rounded-xl border border-border bg-background p-4 text-foreground shadow-sm">
        <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Light
        </p>
        <div className="flex justify-center">{renderContent()}</div>
      </div>
      <div className="dark rounded-xl border border-border bg-background p-4 text-foreground shadow-sm">
        <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Dark
        </p>
        <div className="flex justify-center">{renderContent()}</div>
      </div>
    </div>
  );
}

const Index = () => {
  const [playgroundSize, setPlaygroundSize] = useState(180);
  const [playgroundSpeed, setPlaygroundSpeed] = useState(1);
  const [playgroundPaused, setPlaygroundPaused] = useState(false);
  const [playgroundColor, setPlaygroundColor] = useState('#7c3aed');

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-xl border border-border bg-card px-5 py-5">
          <h1 className="text-2xl font-semibold text-foreground">RubixLoader Prop Playground</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every example is shown on <strong className="font-medium text-foreground">light</strong> and{' '}
            <strong className="font-medium text-foreground">dark</strong> surfaces side by side.
          </p>
        </header>

        <section className="mb-10 rounded-xl border border-border bg-muted/30 p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Interactive playground</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr_minmax(280px,320px)] lg:items-start">
            <DualThemeSurface
              renderContent={() => (
                <RubixLoader
                  size={playgroundSize}
                  speed={playgroundSpeed}
                  paused={playgroundPaused}
                  colors={[playgroundColor]}
                />
              )}
              className="lg:col-span-2"
            />

            <div className="space-y-4 rounded-xl border border-border bg-card p-4 lg:min-h-0">
              <h3 className="text-sm font-semibold text-foreground">Controls</h3>

              <label className="block text-xs text-foreground/90">
                Size: {playgroundSize}
                <input
                  className="mt-1 w-full"
                  type="range"
                  min={20}
                  max={800}
                  step={5}
                  value={playgroundSize}
                  onChange={(event) => setPlaygroundSize(Number(event.target.value))}
                />
              </label>

              <label className="block text-xs text-foreground/90">
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

              <label className="flex items-center gap-2 text-xs text-foreground/90">
                <input
                  type="checkbox"
                  checked={playgroundPaused}
                  onChange={(event) => setPlaygroundPaused(event.target.checked)}
                />
                Paused
              </label>

              <div className="grid grid-cols-[44px_1fr] items-center gap-2 text-xs text-foreground/90">
                <input
                  type="color"
                  value={playgroundColor}
                  onChange={(event) => setPlaygroundColor(event.target.value)}
                  aria-label="Color picker"
                />
                <input
                  className="rounded border border-input bg-background px-2 py-1"
                  value={playgroundColor}
                  onChange={(event) => setPlaygroundColor(event.target.value)}
                  placeholder="#7c3aed or rgb(124,58,237)"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Live color cycling (no reset)</h2>
          <DualThemeSurface
            renderContent={() => <RubixLoader size={220} speed={1} colors={CYCLING_COLORS} />}
          />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Internal colors cycle every 1.3s ({CYCLING_COLORS.join(' → ')}).
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Size variations</h2>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Light
              </p>
              <div className="flex flex-wrap items-end justify-center gap-6 rounded-xl border border-border bg-background p-5 shadow-sm">
                {SIZE_EXAMPLES.map((size) => (
                  <div key={`light-${size}`} className="flex flex-col items-center gap-2">
                    <RubixLoader size={size} speed={1} colors={['#6366f1']} />
                    <span className="text-xs text-muted-foreground">size {size}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="dark">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Dark
              </p>
              <div className="flex flex-wrap items-end justify-center gap-6 rounded-xl border border-border bg-background p-5 shadow-sm">
                {SIZE_EXAMPLES.map((size) => (
                  <div key={`dark-${size}`} className="flex flex-col items-center gap-2">
                    <RubixLoader size={size} speed={1} colors={['#6366f1']} />
                    <span className="text-xs text-muted-foreground">size {size}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Preset variants</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {EXAMPLES.map((example) => (
              <div
                key={example.label}
                className="rounded-xl border border-border bg-muted/30 p-4"
              >
                <DualThemeSurface
                  renderContent={() => (
                    <RubixLoader
                      size={example.size}
                      speed={example.speed}
                      paused={example.paused}
                      colors={example.color ? [example.color] : undefined}
                    />
                  )}
                />
                <div className="mt-3 text-center">
                  <p className="text-sm font-medium text-foreground">{example.label}</p>
                  <p className="text-xs text-muted-foreground">
                    size {example.size}
                    {example.speed ? ` • speed ${example.speed}` : ''}
                    {example.paused ? ' • paused' : ''}
                    {example.color ? ` • ${example.color}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
