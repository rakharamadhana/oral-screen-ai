import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageZoomModalProps {
  url: string;
  caption?: string;
  onClose: () => void;
}

export function ImageZoomModal({ url, caption, onClose }: ImageZoomModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialTouchDistRef = useRef<number | null>(null);
  const initialScaleRef = useRef(1);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const zoomFactor = e.deltaY < 0 ? 0.25 : -0.25;
    setScale((prevScale) => {
      const newScale = Math.min(Math.max(1, prevScale + zoomFactor), 4);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  };

  // Mouse Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mobile Touch Gestures (Pinch to Zoom & Touch Drag)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Two-finger pinch init
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      initialTouchDistRef.current = dist;
      initialScaleRef.current = scale;
    } else if (e.touches.length === 1 && scale > 1) {
      // Single-finger pan init
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialTouchDistRef.current !== null) {
      // Pinching
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const factor = currentDist / initialTouchDistRef.current;
      const newScale = Math.min(Math.max(1, initialScaleRef.current * factor), 4);
      setScale(newScale);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      // Touch Panning
      setPosition({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y,
      });
    }
  };

  const handleTouchEnd = () => {
    initialTouchDistRef.current = null;
    setIsDragging(false);
  };

  // Double click / tap to toggle zoom
  const handleDoubleClick = () => {
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2);
    }
  };

  return createPortal(
    <div
      onClick={onClose}
      onWheel={handleWheel}
      className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-xs sm:p-md select-none animate-fade-in"
    >
      {/* Top Toolbar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full flex items-center justify-between z-10 p-xs"
      >
        <div className="bg-black/60 backdrop-blur-md text-white/90 px-sm sm:px-md py-1 rounded-full text-[11px] sm:text-xs">
          <span className="hidden sm:inline">Roda mouse / Pinch ({Math.round(scale * 100)}%)</span>
          <span className="sm:hidden">{Math.round(scale * 100)}%</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-xs">
          <button
            onClick={() => setScale((s) => Math.min(4, s + 0.5))}
            className="p-1.5 sm:p-xs rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Perbesar (+)"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={() => {
              const next = Math.max(1, scale - 0.5);
              setScale(next);
              if (next === 1) setPosition({ x: 0, y: 0 });
            }}
            className="p-1.5 sm:p-xs rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Perkecil (-)"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={() => {
              setScale(1);
              setPosition({ x: 0, y: 0 });
            }}
            className="p-1.5 sm:p-xs rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-xs rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors ml-xs"
            title="Tutup (ESC)"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
        className="w-full flex-1 flex items-center justify-center overflow-hidden relative cursor-grab active:cursor-grabbing touch-none"
      >
        <img
          src={url}
          alt={caption || 'Gambar Zoom'}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="max-w-[95vw] max-h-[82vh] object-contain rounded-lg shadow-2xl pointer-events-none"
        />
      </div>

      {/* Caption at bottom */}
      {caption && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="z-10 mb-xs bg-black/70 backdrop-blur-md text-white/90 text-xs sm:text-body-sm px-md py-xs rounded-full text-center max-w-xl"
        >
          {caption}
        </div>
      )}
    </div>,
    document.body,
  );
}
