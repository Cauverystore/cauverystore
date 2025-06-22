// src/components/Drawer.tsx
import React from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
}

const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div
        className={`fixed inset-y-0 w-80 bg-white dark:bg-gray-900 shadow-xl transition-transform duration-300 ease-in-out ${
          position === 'right' ? 'right-0 translate-x-0' : 'left-0 -translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-600 dark:text-gray-400 hover:text-red-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-full">
          {children}
        </div>
      </div>
    </Dialog>
  );
};

export default Drawer;
