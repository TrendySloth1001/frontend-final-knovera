'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  width?: 'sm' | 'md' | 'lg' | 'full';
}

export default function Drawer({ isOpen, onClose, children, title, width = 'md' }: DrawerProps) {
  // Prevent body scroll when drawer is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const widthClasses = {
    sm: 'w-full sm:w-80 lg:w-96',
    md: 'w-full sm:w-96 lg:w-[500px]',
    lg: 'w-full sm:w-[500px] lg:w-[600px]',
    full: 'w-full'
  };

  return (
    <>
      {/* Backdrop - Only on mobile/tablet */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full bg-[#000000] border-l border-neutral-800 z-[70] transform transition-transform duration-300 ease-in-out ${
          widthClasses[width]
        } ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-800">
            <h2 className="text-lg sm:text-xl font-semibold text-white truncate pr-4">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors flex-shrink-0"
              aria-label="Close drawer"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="h-full overflow-y-auto pb-20">
          {children}
        </div>
      </div>
    </>
  );
}
