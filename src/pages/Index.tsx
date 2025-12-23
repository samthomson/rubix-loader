import RubixLoader from '@/components/RubixLoader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-pink-900/20 via-transparent to-transparent" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-screen space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700">
              Rubix Loader
            </h1>
            <p className="text-xl md:text-2xl text-purple-200/80 font-light animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
              A mesmerizing 3D cube solving animation
            </p>
          </div>

          {/* Main loader showcase */}
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl shadow-purple-500/20">
              <CardContent className="p-16">
                <RubixLoader size={200} />
              </CardContent>
            </Card>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-7 duration-700 delay-300">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
              <CardHeader>
                <CardTitle className="text-purple-200 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  3D Perspective
                </CardTitle>
                <CardDescription className="text-purple-300/60">
                  Rendered with CSS 3D transforms for smooth, hardware-accelerated animations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20">
              <CardHeader>
                <CardTitle className="text-pink-200 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                  Glass Morphism
                </CardTitle>
                <CardDescription className="text-pink-300/60">
                  Transparent glass-like appearance with elegant pinky-purple gradients
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
              <CardHeader>
                <CardTitle className="text-purple-200 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  Solving Animation
                </CardTitle>
                <CardDescription className="text-purple-300/60">
                  Each cube piece rotates independently, mimicking the solving process
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Size variations */}
          <div className="space-y-8 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Available Sizes
            </h2>
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardContent className="p-8">
                <div className="flex flex-wrap items-center justify-around gap-12">
                  <div className="text-center space-y-2">
                    <RubixLoader size={80} />
                    <p className="text-purple-300/80 text-sm">Small (80px)</p>
                  </div>
                  <div className="text-center space-y-2">
                    <RubixLoader size={120} />
                    <p className="text-purple-300/80 text-sm">Medium (120px)</p>
                  </div>
                  <div className="text-center space-y-2">
                    <RubixLoader size={160} />
                    <p className="text-purple-300/80 text-sm">Large (160px)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2 animate-in fade-in duration-700 delay-500">
            <p className="text-purple-300/60 text-sm">
              Vibed with{' '}
              <a
                href="https://shakespeare.diy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors underline decoration-dotted underline-offset-4"
              >
                Shakespeare
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
