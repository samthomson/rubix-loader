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

## Exported Color Enum

- `RubixLoaderColor.RelayKit` - default lavender tone
- `RubixLoaderColor.Strfry` - yellow
- `RubixLoaderColor.NostrRs` - red
- `RubixLoaderColor.Blossom` - pink
- `RubixLoaderColor.Nsite` - black
