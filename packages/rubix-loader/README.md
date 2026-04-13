# @samthomson/rubix-loader

Animated 3D Rubix cube loader React component rendered on canvas.

## Install

```bash
npm i @samthomson/rubix-loader
```

## Usage

```tsx
import { RubixLoader, RubixLoaderColor } from '@samthomson/rubix-loader';

export function Example() {
  return (
    <RubixLoader
      size={220}
      speed={1}
      paused={false}
      colors={[
        RubixLoaderColor.RelayKit,
        RubixLoaderColor.Strfry,
        RubixLoaderColor.NostrRs,
        RubixLoaderColor.Blossom,
        RubixLoaderColor.Npanel,
      ]}
    />
  );
}
```

## Props

- `size?: number` - canvas size in pixels (default `400`)
- `speed?: number` - animation speed multiplier (default `1`)
- `paused?: boolean` - pause motion without unmounting
- `colors?: string[]` - one color for static look, multiple for cycling
- `className?: string` - wrapper class name

## Preset colors (`RubixLoaderColor`)

Plain object (`as const`), not a TypeScript `enum`, so named exports stay obvious in bundled output.

| Token       | Hex       | Notes                          |
|------------|-----------|--------------------------------|
| `RelayKit` | `#A78BFA` | Violet accent                  |
| `Strfry`   | `#FBBF24` | Amber / warm yellow            |
| `NostrRs`  | `#F87171` | Coral-red                      |
| `Blossom`  | `#E879F9` | Fuchsia-pink                   |
| `Npanel`   | `#52525B` | Zinc neutral (not pure black)  |

### Vite oddities (stale exports / missing named imports)

Restart the dev server or delete `node_modules/.vite` after upgrading the package — Vite’s dep pre-bundle cache is often the culprit.

If it still happens, you can opt out of pre-bundling this package:

```ts
// vite.config.ts
optimizeDeps: { exclude: ['@samthomson/rubix-loader'] },
```
