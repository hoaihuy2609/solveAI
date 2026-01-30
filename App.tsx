
import React, { useState, useCallback } from 'react';
import { Upload, ImagePlus, Loader2, Sparkles, Trash2, AlertCircle } from 'lucide-react';
import { ImageFile } from './types';
import ImageCard from './components/ImageCard';
import LatexOutput from './components/LatexOutput';
import { solveProblemsFromImages } from './services/geminiService';

const MAX_IMAGES = 10;

const App: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    // Convert FileList to File[] array to ensure correct typing
    const files: File[] = Array.from(fileList);
    
    if (images.length + files.length > MAX_IMAGES) {
      setError(`You can only upload up to ${MAX_IMAGES} images.`);
      return;
    }

    // Explicitly type the map parameter as File to resolve unknown type errors for URL.createObjectURL and ImageFile assignment
    const newImages: ImageFile[] = files.map((file: File) => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImages]);
    setError(null);
    // Reset input so the same file can be selected again if needed
    e.target.value = '';
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return filtered;
    });
  };

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setResult('');
    setError(null);
  };

  const handleSolve = async () => {
    if (images.length === 0) return;
    
    setLoading(true);
    setResult('');
    setError(null);

    try {
      const latex = await solveProblemsFromImages(images.map(img => img.file));
      setResult(latex);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while solving.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative selection:bg-brand-500 selection:text-white overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-400/30 rounded-full blur-[120px] animate-float transform translate-z-0"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/30 rounded-full blur-[120px] animate-float delay-200 transform translate-z-0"></div>
        <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-pink-400/20 rounded-full blur-[100px] animate-float delay-100 transform translate-z-0"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center justify-center p-3.5 bg-white/50 backdrop-blur-sm border border-white/50 rounded-2xl mb-6 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
            <Sparkles className="text-brand-600" size={32} />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-4 drop-shadow-sm">
            LaTeX Math <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">Solver AI</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Transform your math problems into perfect LaTeX code. <br className="hidden sm:block"/>
            Powered by advanced AI for instant, step-by-step solutions.
          </p>
        </div>

        {/* Main Interface */}
        <div className="glass rounded-3xl shadow-2xl shadow-slate-200/50 p-1 animate-fade-in-up delay-100">
          <div className="bg-white/50 backdrop-blur-xl rounded-[20px] p-6 sm:p-10 border border-white/20">
            
            {/* Upload Area */}
            <div className="mb-8">
              <label 
                className={`
                  relative flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-2xl cursor-pointer 
                  transition-all duration-300 ease-out group
                  ${images.length >= MAX_IMAGES 
                    ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-60' 
                    : 'bg-slate-50/50 hover:bg-brand-50/50 border-slate-300 hover:border-brand-400 hover:shadow-lg hover:shadow-brand-100/50 hover:scale-[1.005]'}
                `}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <div className={`p-4 rounded-full bg-white shadow-sm mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${images.length < MAX_IMAGES ? 'text-brand-500' : 'text-slate-400'}`}>
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="mb-2 text-base text-slate-700 font-medium">
                    <span className="text-brand-600 font-bold hover:underline">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-sm text-slate-500">
                    Supports PNG, JPG, WebP (Max {MAX_IMAGES})
                  </p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  multiple 
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={images.length >= MAX_IMAGES}
                />
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-8 p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-xl flex items-start gap-3 text-red-700 animate-fade-in-up">
                <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-600" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Previews */}
            {images.length > 0 && (
              <div className="mb-10 animate-fade-in-up">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
                    Selected Images ({images.length}/{MAX_IMAGES})
                  </h3>
                  <button 
                    onClick={clearAll}
                    className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {images.map((img, idx) => (
                    <div className="animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }} key={img.id}>
                      <ImageCard 
                        previewUrl={img.previewUrl} 
                        onRemove={() => removeImage(img.id)} 
                      />
                    </div>
                  ))}
                  {images.length < MAX_IMAGES && (
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all group">
                      <ImagePlus size={24} className="text-slate-400 group-hover:text-slate-600 group-hover:scale-110 transition-transform" />
                      <input 
                        type="file" 
                        className="hidden" 
                        multiple 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSolve}
                disabled={loading || images.length === 0}
                className={`
                  relative overflow-hidden group flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl
                  ${loading || images.length === 0 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                    : 'bg-gradient-to-r from-brand-600 via-brand-500 to-purple-600 text-white hover:shadow-brand-500/30 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0.5'}
                `}
              >
                 {loading || images.length === 0 ? null : (
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
                 )}
                {loading ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    <span>Analyzing Problems...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={22} className={images.length > 0 ? 'animate-pulse' : ''} />
                    <span>Generate Solution</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="animate-fade-in-up delay-200">
            <LatexOutput content={result} />
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-6 text-sm font-medium text-slate-500 bg-white/60 backdrop-blur px-6 py-3 rounded-full border border-white/50 shadow-sm">
             <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Multi-image Processing
            </span>
            <span className="w-px h-4 bg-slate-300"></span>
            <span className="flex items-center gap-1.5">
               <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              Gemini 1.5 Flash
            </span>
          </div>
          <p className="mt-6 text-slate-400 text-sm font-medium">© 2024 LaTeX Math Solver AI</p>
        </div>
      </div>
    </div>
  );
};

export default App;
