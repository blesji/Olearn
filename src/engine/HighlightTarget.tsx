import React from 'react';

interface HighlightTargetProps {
  elementId: string;
  activeHighlightId: string;
  onCorrectTap: () => void;
  onWrongTap: () => void;
  className?: string;
  badgePosition?: 'top-right' | 'top-left' | 'top-center' | 'inner-right';
  children: React.ReactNode;
}

/**
 * HighlightTarget wraps a screen component.
 * If its elementId matches the active step's highlight_element, it renders with a prominent,
 * high-contrast pulsing border and pointer icon, and routes clicks to onCorrectTap.
 * If it is inert, clicking it triggers a gentle nudge (toast + sound) without penalty.
 */
export const HighlightTarget: React.FC<HighlightTargetProps> = ({
  elementId,
  activeHighlightId,
  onCorrectTap,
  onWrongTap,
  className = '',
  badgePosition,
  children
}) => {
  const isHighlighted = elementId === activeHighlightId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isHighlighted) {
      onCorrectTap();
    } else {
      onWrongTap();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      if (isHighlighted) {
        onCorrectTap();
      } else {
        onWrongTap();
      }
    }
  };

  // Determine viewport-safe badge placement based on element position
  const getBadgePositionClass = () => {
    if (badgePosition === 'top-left') return '-top-2.5 -left-2';
    if (badgePosition === 'top-center') return '-top-3 left-1/2 -translate-x-1/2';
    if (badgePosition === 'inner-right') return 'top-0 right-0';
    if (badgePosition === 'top-right') return '-top-2.5 right-0 sm:-right-2';

    // Intelligent defaults for edge & composer controls
    if (elementId === 'send_button' || elementId === 'mic_record_button' || elementId === 'voice_call_icon') {
      return '-top-2.5 left-0';
    }
    if (elementId === 'chat_input') {
      return '-top-3 left-6';
    }
    return '-top-2.5 right-0 sm:-right-2';
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={isHighlighted ? 'Active step button, tap to proceed' : 'Inactive button'}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`relative transition-all duration-200 select-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-500 ${
        isHighlighted
          ? 'highlight-active z-30 ring-3 ring-amber-400 ring-offset-1 rounded-xl'
          : 'opacity-95 hover:opacity-90'
      } ${className}`}
      data-element-id={elementId}
    >
      {children}
      {isHighlighted && (
        <div
          className={`absolute ${getBadgePositionClass()} z-40 bg-amber-500 text-black p-1 rounded-full shadow-lg border-2 border-white pointer-events-none animate-bounce flex items-center justify-center`}
          aria-hidden="true"
        >
          <svg className="w-5 h-5 text-black fill-current" viewBox="0 0 24 24">
            <path d="M9 11.24V7.5a2.5 2.5 0 0 1 5 0v3.74c1.21-.81 2-2.18 2-3.74a4.5 4.5 0 0 0-9 0c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.09-.37-.14-.56-.14H13v-6a1 1 0 0 0-2 0v7.61l-3.32-.7a1.99 1.99 0 0 0-1.74.52l-.84.84 5.09 5.09c.56.56 1.33.88 2.13.88h5.36c1.54 0 2.83-1.16 2.98-2.69l.43-4.32a1.8 1.8 0 0 0-.75-1.83z" />
          </svg>
        </div>
      )}
    </div>
  );
};
