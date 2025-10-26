import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { ComponentType } from '../types/page-editor';

interface ComponentPaletteProps {
  className?: string;
}

interface PaletteItemProps {
  type: ComponentType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const PaletteItem: React.FC<PaletteItemProps> = ({ type, title, description, icon }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: {
      type: 'component',
      componentType: type,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        group relative bg-white border-2 border-gray-200 rounded-lg p-4 cursor-grab
        hover:border-blue-300 hover:shadow-md transition-all duration-200
        ${isDragging ? 'opacity-50 rotate-6 scale-105' : 'opacity-100'}
      `}
    >
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
          {icon}
        </div>
        <div>
          <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
};

const ComponentPalette: React.FC<ComponentPaletteProps> = ({ className = '' }) => {
  const components: PaletteItemProps[] = [
    {
      type: 'hero',
      title: 'Hero Section',
      description: 'Eye-catching header with title, subtitle, and CTA',
      icon: (
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
    },
    {
      type: 'about',
      title: 'About Me',
      description: 'Introduce yourself and your expertise',
      icon: (
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      type: 'services',
      title: 'Services',
      description: 'Showcase your wellness services and offerings',
      icon: (
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      type: 'booking',
      title: 'Book Session',
      description: 'Let clients book appointments easily',
      icon: (
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      type: 'testimonials',
      title: 'Testimonials',
      description: 'Display client reviews and success stories',
      icon: (
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
    },
    {
      type: 'pricing',
      title: 'Pricing',
      description: 'Show your packages and pricing tiers',
      icon: (
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
    },
    {
      type: 'gallery',
      title: 'Gallery',
      description: 'Showcase your studio and work',
      icon: (
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      type: 'contact',
      title: 'Contact Info',
      description: 'Display your contact details and location',
      icon: (
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
    {
      type: 'text',
      title: 'Text Block',
      description: 'Add custom text and rich content',
      icon: (
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      ),
    },
    {
      type: 'social',
      title: 'Social Links',
      description: 'Connect with your social media profiles',
      icon: (
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
    {
      type: 'spacer',
      title: 'Spacer',
      description: 'Add whitespace between sections',
      icon: (
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`bg-white border-r border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Components</h3>
        <p className="text-sm text-gray-500 mt-1">Drag components to your page</p>
      </div>
      
      <div className="p-4 overflow-y-auto">
        <div className="grid grid-cols-1 gap-3">
          {components.map((component) => (
            <PaletteItem
              key={component.type}
              type={component.type}
              title={component.title}
              description={component.description}
              icon={component.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComponentPalette;