
import React from 'react';
import { X } from 'lucide-react';

interface ImageCardProps {
  previewUrl: string;
  onRemove: () => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ previewUrl, onRemove }) => {
  return (
    <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10 hover:-translate-y-1">
      <div className="aspect-square overflow-hidden bg-slate-100 relative">
        <img
          src={previewUrl}
          alt="Problem"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
      </div>
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1.5 bg-red-500/90 backdrop-blur-sm text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-lg transform scale-90 group-hover:scale-100"
        title="Remove image"
      >
        <X size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default ImageCard;
