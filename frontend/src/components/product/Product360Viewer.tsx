import React, { useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { X, RotateCw, Sparkles, HelpCircle } from 'lucide-react';
import type { Product } from '../../types';


interface Product360ViewerProps {
  product: Product | null;
  onClose: () => void;
}

export const Product360Viewer: React.FC<Product360ViewerProps> = ({ product, onClose }) => {
  if (!product) return null;

  const [autoSpin, setAutoSpin] = useState(false);
  const [rotation, setRotation] = useState(0); // in degrees

  // Gesture tracking
  const bind = useDrag(({ delta: [dx] }) => {
    // Horizontal swipe updates the rotation
    setRotation((prev) => (prev + dx * 0.8) % 360);
  }) as any;

  // Automatically spin the garment if toggle is active
  React.useEffect(() => {
    if (!autoSpin) return;
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 2) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [autoSpin]);

  // Derived styling for premium lighting reflection
  const shimmerTranslateX = useMotionValue(0);
  React.useEffect(() => {
    // Map rotation to horizontal shimmer reflection offset
    shimmerTranslateX.set(((rotation % 360) / 360) * 400 - 200);
  }, [rotation, shimmerTranslateX]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose}></div>

      {/* Canvas Dialog Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-white border border-panelBorder rounded-3xl overflow-hidden relative z-10 shadow-2xl flex flex-col items-center p-6 md:p-8"
      >
        {/* Header bar */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-panelBorder/60 mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-[#FAF0F1] p-2.5 rounded-xl border border-coral/10 text-coral">
              <RotateCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">Interactive 360° Studio</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Zero-Inventory Calibration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-lavender-deep/60 hover:bg-lavender-deep text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3D Canvas Box */}
        <div
          {...(bind() as any)}
          className="relative w-full aspect-square bg-gradient-to-b from-[#FBFBF9] to-[#FAF6EE] border border-panelBorder rounded-2xl flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing group select-none"
        >
          {/* Grid lines indicator for 3D layout */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,168,128,0.05)_10%,transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

          {/* Hologram details */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-1 text-left">
            <span className="text-[9px] bg-coral/5 border border-coral/15 px-2 py-0.5 rounded text-coral font-bold flex items-center gap-1.5 w-max">
              <Sparkles className="w-2.5 h-2.5" />
              <span>LIVE RENDER</span>
            </span>
            <span className="text-[10px] text-gray-600 font-bold mt-1 uppercase">{product.name}</span>
          </div>

          <div className="absolute bottom-4 right-4 z-20 text-right">
            <p className="text-[9px] text-gray-400 font-semibold tracking-wider">DRAG HORIZONTALLY</p>
            <p className="text-[10px] text-coral font-extrabold font-jakarta">{Math.round(rotation < 0 ? 360 + rotation : rotation)}° Y-AXIS</p>
          </div>

          {/* 3D Rotated Image Wrapper */}
          <div
            className="w-4/5 h-4/5 flex items-center justify-center relative perspective-[1000px]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <motion.div
              style={{
                transformStyle: 'preserve-3d',
                rotateY: rotation,
              }}
              className="w-full h-full flex items-center justify-center relative"
            >
              {/* Product Image Front */}
              <img
                src={product.image}
                alt={product.name}
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)] pointer-events-none select-none"
              />

              {/* Skewed light reflection shimmer overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20"
                style={{
                  translateX: shimmerTranslateX,
                  skewX: -20,
                }}
              />
            </motion.div>
          </div>

          {/* Spin indicator badge */}
          <div className="absolute bottom-4 left-4 z-20 bg-white/95 border border-panelBorder p-2.5 rounded-xl flex items-center gap-1.5 shadow-md">
            <RotateCw className="w-3.5 h-3.5 text-coral animate-spin-slow" />
            <span className="text-[10px] text-gray-700 font-bold">Swipe to Spin</span>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full flex items-center justify-between mt-6 gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoSpin(!autoSpin)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                autoSpin
                  ? 'bg-coral text-white border-coral shadow-lg shadow-coral/10'
                  : 'bg-white border-panelBorder text-gray-600 hover:text-gray-900'
              }`}
            >
              {autoSpin ? 'Pause Rotation' : 'Auto Spin 360°'}
            </button>
            <button
              onClick={() => setRotation(0)}
              className="p-2.5 rounded-xl bg-white hover:bg-lavender-deep border border-panelBorder text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              title="Reset View"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <HelpCircle className="w-4 h-4 text-coral" />
            <span>Simulated boutique fitting studio</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default Product360Viewer;
