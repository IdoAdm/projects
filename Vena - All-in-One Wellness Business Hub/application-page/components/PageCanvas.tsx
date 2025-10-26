import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { PageComponent } from '../types/page-editor';
import ComponentRenderer from './ComponentRenderer';

interface PageCanvasProps {
  components: PageComponent[];
  selectedComponentId: string | null;
  previewMode: boolean;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (id: string, updates: Partial<PageComponent>) => void;
  className?: string;
}

interface DroppableCanvasProps {
  children: React.ReactNode;
  isEmpty: boolean;
}

const DroppableCanvas: React.FC<DroppableCanvasProps> = ({ children, isEmpty }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'page-canvas',
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-full w-full relative
        ${isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''}
        ${isEmpty ? 'flex items-center justify-center' : ''}
      `}
    >
      {isEmpty && !isOver && (
        <div className="text-center py-20">
          <div className="mx-auto w-24 h-24 mb-4 flex items-center justify-center bg-gray-100 rounded-full">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Page</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            Drag components from the sidebar to create your wellness landing page. 
            Perfect for yoga studios, personal trainers, and wellness coaches.
          </p>
        </div>
      )}
      
      {isOver && isEmpty && (
        <div className="text-center py-20">
          <div className="mx-auto w-24 h-24 mb-4 flex items-center justify-center bg-blue-100 rounded-full">
            <svg
              className="w-12 h-12 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-blue-900 mb-2">Drop Your Component Here</h3>
          <p className="text-blue-700 max-w-sm mx-auto">
            Release to add this component to your page.
          </p>
        </div>
      )}
      
      {children}
    </div>
  );
};

interface SortableComponentProps {
  component: PageComponent;
  isSelected: boolean;
  previewMode: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<PageComponent>) => void;
}

const SortableComponent: React.FC<SortableComponentProps> = ({
  component,
  isSelected,
  previewMode,
  onSelect,
  onUpdate,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: component.id,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative group
        ${isDragging ? 'z-50 opacity-50' : ''}
        ${!previewMode && isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
      `}
      onClick={(e) => {
        e.stopPropagation();
        if (!previewMode) {
          onSelect();
        }
      }}
    >
      {/* Drag Handle - Only visible in edit mode */}
      {!previewMode && (
        <div
          {...attributes}
          {...listeners}
          className={`
            absolute -left-8 top-1/2 -translate-y-1/2 z-10
            w-6 h-8 bg-gray-700 text-white rounded-l-md
            flex items-center justify-center cursor-grab
            opacity-0 group-hover:opacity-100 transition-opacity
            hover:bg-gray-800
          `}
          title="Drag to reorder"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </div>
      )}

      {/* Selection Indicator */}
      {!previewMode && isSelected && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-t">
            {component.type.charAt(0).toUpperCase() + component.type.slice(1)} Component
          </div>
        </div>
      )}

      {/* Component Content */}
      <ComponentRenderer
        component={component}
        isEditing={!previewMode}
        onUpdate={onUpdate}
      />

      {/* Hover Overlay - Only in edit mode */}
      {!previewMode && !isSelected && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-0 hover:bg-opacity-10 transition-opacity cursor-pointer" />
      )}
    </div>
  );
};

const PageCanvas: React.FC<PageCanvasProps> = ({
  components,
  selectedComponentId,
  previewMode,
  onSelectComponent,
  onUpdateComponent,
  className = '',
}) => {
  const sortedComponents = [...components].sort((a, b) => a.order - b.order);
  const componentIds = sortedComponents.map(c => c.id);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the canvas background
    if (e.target === e.currentTarget) {
      onSelectComponent(null);
    }
  };

  return (
    <div className={`bg-white ${className}`}>
      {/* Canvas Header */}
      {!previewMode && (
        <div className="border-b border-gray-200 px-6 py-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Page Editor</h2>
              <p className="text-sm text-gray-500">
                {components.length === 0 
                  ? 'Start by dragging components from the left sidebar'
                  : `${components.length} component${components.length !== 1 ? 's' : ''} on your page`
                }
              </p>
            </div>
            
            {selectedComponentId && (
              <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded">
                Component selected - Edit in the right panel
              </div>
            )}
          </div>
        </div>
      )}

      {/* Canvas Content */}
      <div 
        className="relative"
        onClick={handleCanvasClick}
      >
        <DroppableCanvas isEmpty={components.length === 0}>
          {components.length > 0 && (
            <SortableContext items={componentIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-0">
                {sortedComponents.map((component) => (
                  <SortableComponent
                    key={component.id}
                    component={component}
                    isSelected={component.id === selectedComponentId}
                    previewMode={previewMode}
                    onSelect={() => onSelectComponent(component.id)}
                    onUpdate={(updates) => onUpdateComponent(component.id, updates)}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </DroppableCanvas>
      </div>
    </div>
  );
};

export default PageCanvas;