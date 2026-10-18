import React from 'react'
import { X } from 'lucide-react'
import { Sidebar } from './Sidebar'

interface MobileNavigationProps {
  isOpen: boolean
  onClose: () => void
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="relative w-72 max-w-[85vw] h-full shadow-2xl flex flex-col z-50">
        <button
          onClick={onClose}
          className="absolute top-4 right-3 z-50 p-2 text-white/80 hover:text-white bg-black/30 rounded-lg"
          aria-label="Close mobile navigation"
        >
          <X className="w-5 h-5" />
        </button>
        <Sidebar
          collapsed={false}
          onToggleCollapse={() => {}}
          onCloseMobile={onClose}
        />
      </div>
    </div>
  )
}
