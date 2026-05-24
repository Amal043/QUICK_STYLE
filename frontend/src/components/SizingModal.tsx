import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { X, Sparkles, AlertCircle, Heart } from 'lucide-react';
import type { Size } from '../types';

interface SizingModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  onSelectSize: (size: Size) => void;
}

// Zod schema for size calibration measurements validation
const sizingSchema = z.object({
  height: z.preprocess(
    (val) => Number(val),
    z.number().min(100, "Height must be at least 100 cm").max(250, "Height cannot exceed 250 cm")
  ),
  weight: z.preprocess(
    (val) => Number(val),
    z.number().min(30, "Weight must be at least 30 kg").max(200, "Weight cannot exceed 200 kg")
  ),
  preference: z.enum(['Tight', 'Regular', 'Relaxed', 'Oversized'])
});

type SizingFormData = z.infer<typeof sizingSchema>;

export const SizingModal: React.FC<SizingModalProps> = ({
  isOpen,
  onClose,
  productName,
  onSelectSize
}) => {
  const [result, setResult] = useState<{
    size: Size;
    confidence: number;
    description: string;
  } | null>(null);

  // Initialize React Hook Form
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SizingFormData>({
    defaultValues: {
      height: 175,
      weight: 70,
      preference: 'Regular'
    }
  });

  const preferenceValue = watch('preference');

  if (!isOpen) return null;

  const onSubmit = (data: SizingFormData) => {
    // Validate with Zod
    const validationResult = sizingSchema.safeParse(data);
    if (!validationResult.success) {
      alert("Invalid form parameters entered.");
      return;
    }

    const { height: h, weight: w, preference: pref } = validationResult.data;

    // Sizing computation simulation
    let calculatedSize: Size = 'M';
    if (w < 60) {
      calculatedSize = h < 170 ? 'S' : 'M';
    } else if (w >= 60 && w <= 75) {
      calculatedSize = pref === 'Oversized' ? 'L' : 'M';
    } else if (w > 75 && w <= 90) {
      calculatedSize = pref === 'Tight' ? 'M' : 'L';
    } else {
      calculatedSize = 'XL';
    }

    // Adjust for fit preference
    let conf = 94;
    if (pref === 'Oversized') conf = 89;
    if (pref === 'Regular') conf = 96;

    setResult({
      size: calculatedSize,
      confidence: conf,
      description: `Based on your profile, the ${productName} in size ${calculatedSize} is mapped to your H&M/Zara Size ${calculatedSize} profile. It offers a ${pref.toLowerCase()} fit with high calibration confidence.`
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>

      {/* Dialog */}
      <div className="bg-white border border-panelBorder rounded-3xl w-full max-w-md overflow-hidden relative z-10 shadow-2xl animate-slide-up">
        
        {/* Header */}
        <div className="p-6 border-b border-panelBorder/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#F5F0FF] p-2 rounded-xl border border-purple-200/50 text-coral">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">AI Fit Calibration</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Size Finder Guide</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-[#F7F5F0] hover:bg-[#EAE6DF] text-gray-500 hover:text-gray-900 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-xs text-gray-600">
            Enter your measurements to find the exact fit for the <span className="text-coral font-bold">{productName}</span>.
          </p>

          {!result ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Inputs row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Height (cm)</label>
                  <input
                    type="number"
                    {...register('height')}
                    className={`w-full h-11 px-4 rounded-xl bg-[#FAF8F5] border text-xs text-gray-800 focus:outline-none focus:border-coral ${
                      errors.height ? 'border-coral' : 'border-panelBorder'
                    }`}
                  />
                  {errors.height && (
                    <span className="text-[10px] text-coral font-bold">{errors.height.message}</span>
                  )}
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Weight (kg)</label>
                  <input
                    type="number"
                    {...register('weight')}
                    className={`w-full h-11 px-4 rounded-xl bg-[#FAF8F5] border text-xs text-gray-800 focus:outline-none focus:border-coral ${
                      errors.weight ? 'border-coral' : 'border-panelBorder'
                    }`}
                  />
                  {errors.weight && (
                    <span className="text-[10px] text-coral font-bold">{errors.weight.message}</span>
                  )}
                </div>
              </div>

              {/* Fit preference selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Preferred Fit</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Tight', 'Regular', 'Relaxed', 'Oversized'] as const).map((pref) => {
                    const isSelected = preferenceValue === pref;
                    return (
                      <button
                        key={pref}
                        type="button"
                        onClick={() => setValue('preference', pref)}
                        className={`py-2 rounded-xl text-[10px] font-bold border transition-colors ${
                          isSelected
                            ? 'bg-[#C5A880] border-[#C5A880] text-white'
                            : 'bg-white border-panelBorder text-gray-700 hover:text-gray-900 hover:border-coral'
                        }`}
                      >
                        {pref}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action */}
              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-coral hover:bg-coral-hover text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-coral/10"
              >
                Calculate True Fit Size
              </button>
            </form>
          ) : (
            <div className="space-y-5 animate-fade-in">
              {/* Output Results */}
              <div className="p-5 rounded-2xl bg-[#F5F1E8] border border-panelBorder text-center space-y-3 relative overflow-hidden">
                <div className="absolute top-2 right-2 text-[#C5A880]/15">
                  <Heart className="w-20 h-20 fill-current" />
                </div>
                
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Your Calibrated Size</p>
                <h4 className="text-5xl font-black text-coral font-jakarta">{result.size}</h4>
                
                <div className="inline-flex items-center gap-1 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                  <Sparkles className="w-3 h-3 fill-current" />
                  <span>{result.confidence}% Match Score</span>
                </div>
              </div>

              <div className="flex gap-3 bg-[#FAF0F1] border border-coral/10 p-3.5 rounded-xl text-xs text-gray-800">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-coral" />
                <p className="leading-relaxed">{result.description}</p>
              </div>

              {/* Action footer */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setResult(null)}
                  className="flex-1 py-3 rounded-xl bg-white hover:bg-[#FAF8F5] border border-panelBorder text-xs text-gray-700 hover:text-gray-900 font-bold transition-all"
                >
                  Recalculate
                </button>
                <button
                  onClick={() => {
                    onSelectSize(result.size);
                    onClose();
                  }}
                  className="flex-1 py-3 rounded-xl bg-coral hover:bg-coral-hover text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-coral/15"
                >
                  Apply Size {result.size}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
