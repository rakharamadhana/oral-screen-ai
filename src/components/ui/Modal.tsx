import { useEffect, useRef, useState, type ReactNode, type TouchEvent } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/** Drag distance (px) past which releasing the handle dismisses the sheet. */
const DISMISS_THRESHOLD = 100;

/**
 * Responsive modal rendered through a portal to document.body.
 *
 * The portal matters: page content is wrapped in PageTransition, whose enter
 * animation leaves a lingering `transform` (animation-fill-mode: both). A
 * transformed ancestor makes `position: fixed` resolve against that element
 * instead of the viewport, which is why in-tree modals drifted to the bottom.
 * Rendering at document.body escapes it entirely.
 *
 * Layout: bottom sheet on mobile (slides up), centered dialog at md+.
 */
export function Modal({
  open,
  onClose,
  children,
  ariaLabel,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  ariaLabel?: string;
}) {
  // Mobile bottom-sheet drag-to-dismiss state (only used by the top handle).
  // dragY (state) drives the visual transform; dragYRef mirrors it so the
  // touchend handler reads the current distance even if events share a tick.
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const dragYRef = useRef(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // lock background scroll
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const onHandleStart = (e: TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setDragging(true);
  };
  const onHandleMove = (e: TouchEvent) => {
    // Only track downward movement.
    const d = Math.max(0, e.touches[0].clientY - startY.current);
    dragYRef.current = d;
    setDragY(d);
  };
  const onHandleEnd = () => {
    setDragging(false);
    const dismissed = dragYRef.current > DISMISS_THRESHOLD;
    dragYRef.current = 0;
    setDragY(0); // snap back if not dismissed
    if (dismissed) onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 md:items-center md:p-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div
        className="modal-sheet relative w-full max-h-[92vh] overflow-y-auto bg-surface-container-lowest rounded-t-2xl shadow-xl md:w-full md:max-w-lg md:max-h-[90vh] md:rounded-xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: dragging ? 'none' : 'transform 0.25s ease',
        }}
      >
        {/* Mobile drag handle — swipe down to dismiss */}
        <div
          className="md:hidden sticky top-0 z-10 flex justify-center pt-sm pb-xs bg-surface-container-lowest touch-none cursor-grab active:cursor-grabbing"
          onTouchStart={onHandleStart}
          onTouchMove={onHandleMove}
          onTouchEnd={onHandleEnd}
        >
          <span className="h-1.5 w-10 rounded-full bg-outline-variant" />
        </div>

        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute right-md top-md z-20 text-on-surface-variant hover:text-on-surface"
        >
          <X size={22} />
        </button>

        <div className="px-lg pb-lg pt-xs md:pt-lg">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
