import React, { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import ComponentPalette from './ComponentPalette';
import PageCanvas from './PageCanvas';
import PropertyPanel from './PropertyPanel';
import type {
  PageComponent,
  ComponentType,
  PageLayout,
  EditorState,
  DragItem,
  HeroComponent,
  AboutComponent,
  ServicesComponent,
  TestimonialsComponent,
  PricingComponent,
  ContactComponent,
  BookingComponent,
  GalleryComponent,
  TextComponent,
  SpacerComponent,
  SocialComponent,
} from '../types/page-editor';
import { supabase } from '../lib/supabaseClient';

interface DragDropPageEditorProps {
  className?: string;
}

// Helper function to create a new component
const createComponent = (type: ComponentType, order: number): PageComponent => {
  const baseComponent = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    order,
    isVisible: true,
    styles: {
      backgroundColor: undefined,
      textColor: undefined,
      padding: { top: 0, bottom: 0, left: 0, right: 0 },
      margin: { top: 0, bottom: 0 },
    },
  };

  // Add type-specific default content
  switch (type) {
    case 'hero': {
      const component: HeroComponent = {
        ...baseComponent,
        type: 'hero',
        content: {
          title: 'Welcome to Your Wellness Journey',
          subtitle: 'Transform your life with personalized wellness coaching',
          buttonText: 'Get Started',
          buttonUrl: '#book',
          layout: 'center',
        },
      };
      return component;
    }
    case 'about': {
      const component: AboutComponent = {
        ...baseComponent,
        type: 'about',
        content: {
          title: 'About Me',
          description:
            'Certified wellness coach with over 10 years of experience helping clients achieve their health and wellness goals.',
          layout: 'text-left',
        },
      };
      return component;
    }
    case 'services': {
      const component: ServicesComponent = {
        ...baseComponent,
        type: 'services',
        content: {
          title: 'My Services',
          services: [],
          layout: 'grid',
        },
      };
      return component;
    }
    case 'booking': {
      const component: BookingComponent = {
        ...baseComponent,
        type: 'booking',
        content: {
          title: 'Ready to Start Your Journey?',
          buttonText: 'Book Now',
          description: 'Book your consultation today and take the first step towards a healthier you.',
          reservekitIntegration: false,
        },
      };
      return component;
    }
    case 'testimonials': {
      const component: TestimonialsComponent = {
        ...baseComponent,
        type: 'testimonials',
        content: {
          title: 'What My Clients Say',
          testimonials: [],
          layout: 'grid',
        },
      };
      return component;
    }
    case 'pricing': {
      const component: PricingComponent = {
        ...baseComponent,
        type: 'pricing',
        content: {
          title: 'Choose Your Plan',
          packages: [],
          layout: 'cards',
        },
      };
      return component;
    }
    case 'contact': {
      const component: ContactComponent = {
        ...baseComponent,
        type: 'contact',
        content: {
          title: 'Get In Touch',
          email: '',
          phone: '',
          address: '',
          socialLinks: {},
          showMap: false,
          layout: 'side-by-side',
        },
      };
      return component;
    }
    case 'gallery': {
      const component: GalleryComponent = {
        ...baseComponent,
        type: 'gallery',
        content: {
          title: 'Gallery',
          images: [],
          layout: 'grid',
        },
      };
      return component;
    }
    case 'text': {
      const component: TextComponent = {
        ...baseComponent,
        type: 'text',
        content: {
          html: '<p>Add your custom text here...</p>',
          alignment: 'left',
        },
      };
      return component;
    }
    case 'spacer': {
      const component: SpacerComponent = {
        ...baseComponent,
        type: 'spacer',
        content: {
          height: 40,
        },
      };
      return component;
    }
    case 'social': {
      const component: SocialComponent = {
        ...baseComponent,
        type: 'social',
        content: {
          title: 'Connect With Me',
          links: {},
          style: 'icons',
        },
      };
      return component;
    }
    default: {
      return {
        ...baseComponent,
      } as PageComponent;
    }
  }
};

const DragDropPageEditor: React.FC<DragDropPageEditorProps> = ({ className = '' }) => {
  const [editorState, setEditorState] = useState<EditorState>({
    currentPage: null,
    selectedComponentId: null,
    draggedComponentType: null,
    previewMode: false,
    isSaving: false,
    hasUnsavedChanges: false,
  });

  const [components, setComponents] = useState<PageComponent[]>([]);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);

  // Initialize with user's existing page or create new one
  React.useEffect(() => {
    const loadUserPage = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Try to load existing page layout from database
        // For now, we'll start with an empty canvas
        console.log('User authenticated, ready to load page for user:', user.id);
      } catch (error) {
        console.error('Error loading user page:', error);
      }
    };

    loadUserPage();
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    if (activeData?.type === 'component') {
      setDraggedItem({
        type: 'component',
        componentType: activeData.componentType,
        id: activeData.id,
      });
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    setDraggedItem(null);

    if (!over) return;

    const activeData = active.data.current;
    const overId = over.id;

    // Handle dropping new component from palette
    if (activeData?.type === 'component' && !activeData.id && overId === 'page-canvas') {
      const newComponent = createComponent(activeData.componentType, components.length);
      setComponents(prev => [...prev, newComponent]);
      setEditorState(prev => ({ ...prev, hasUnsavedChanges: true }));
      return;
    }

    // Handle reordering existing components
    if (activeData?.id && components.find(c => c.id === activeData.id)) {
      const oldIndex = components.findIndex(c => c.id === activeData.id);
      const newIndex = components.findIndex(c => c.id === overId);
      
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reorderedComponents = arrayMove(components, oldIndex, newIndex);
        const updatedComponents = reorderedComponents.map((comp, index) => ({
          ...comp,
          order: index,
        }));
        setComponents(updatedComponents);
        setEditorState(prev => ({ ...prev, hasUnsavedChanges: true }));
      }
    }
  }, [components]);

  const handleSelectComponent = useCallback((componentId: string | null) => {
    setEditorState(prev => ({ ...prev, selectedComponentId: componentId }));
  }, []);

  const handleUpdateComponent = useCallback((componentId: string, updates: Partial<PageComponent>) => {
    setComponents((prev) =>
      prev.map((comp) =>
        comp.id === componentId ? ({ ...comp, ...updates } as PageComponent) : comp,
      ),
    );
    setEditorState((prev) => ({ ...prev, hasUnsavedChanges: true }));
  }, []);

  const handleDeleteComponent = useCallback(() => {
    if (!editorState.selectedComponentId) return;
    
    setComponents(prev => prev.filter(comp => comp.id !== editorState.selectedComponentId));
    setEditorState(prev => ({ 
      ...prev, 
      selectedComponentId: null, 
      hasUnsavedChanges: true 
    }));
  }, [editorState.selectedComponentId]);

  const handleTogglePreview = useCallback(() => {
    setEditorState(prev => ({ ...prev, previewMode: !prev.previewMode }));
  }, []);

  const handleSave = useCallback(async () => {
    setEditorState(prev => ({ ...prev, isSaving: true }));
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const pageLayout: Omit<PageLayout, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.id,
        name: 'My Wellness Page',
        components,
        settings: {
          theme: {
            primaryColor: '#3b82f6',
            secondaryColor: '#64748b',
            fontFamily: 'Inter',
            fontSize: 'medium',
          },
          seo: {
            title: 'My Wellness Practice',
            description: 'Professional wellness coaching services',
            keywords: ['wellness', 'coaching', 'health', 'fitness'],
          },
        },
        isPublished: false,
      };

      // Save to database (implement this based on your schema)
      console.log('Saving page layout:', pageLayout);
      // await supabase.from('page_layouts').upsert(pageLayout);

      setEditorState(prev => ({ ...prev, hasUnsavedChanges: false }));
    } catch (error) {
      console.error('Error saving page:', error);
    } finally {
      setEditorState(prev => ({ ...prev, isSaving: false }));
    }
  }, [components]);

  const selectedComponent = components.find(c => c.id === editorState.selectedComponentId) || null;

  return (
    <div className={`h-screen flex flex-col bg-gray-100 ${className}`}>
      {/* Top Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">Page Editor</h1>
          {editorState.hasUnsavedChanges && (
            <span className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
              Unsaved changes
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleTogglePreview}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              editorState.previewMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {editorState.previewMode ? 'Exit Preview' : 'Preview'}
          </button>
          
          <button
            onClick={handleSave}
            disabled={editorState.isSaving || !editorState.hasUnsavedChanges}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editorState.isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex overflow-hidden">
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Component Palette - Only show in edit mode */}
          {!editorState.previewMode && (
            <ComponentPalette className="w-80 flex-shrink-0" />
          )}

          {/* Main Canvas */}
          <div className="flex-1 overflow-hidden">
            <PageCanvas
              components={components}
              selectedComponentId={editorState.selectedComponentId}
              previewMode={editorState.previewMode}
              onSelectComponent={handleSelectComponent}
              onUpdateComponent={handleUpdateComponent}
              className="h-full overflow-y-auto"
            />
          </div>

          {/* Property Panel - Only show in edit mode */}
          {!editorState.previewMode && (
            <PropertyPanel
              selectedComponent={selectedComponent}
              onUpdateComponent={(updates) => {
                if (editorState.selectedComponentId) {
                  handleUpdateComponent(editorState.selectedComponentId, updates);
                }
              }}
              onDeleteComponent={handleDeleteComponent}
              className="w-80 flex-shrink-0"
            />
          )}

          {/* Drag Overlay */}
          <DragOverlay>
            {draggedItem && (
              <div className="bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg opacity-90">
                <div className="text-sm font-medium text-gray-900">
                  {draggedItem.componentType?.charAt(0).toUpperCase() + draggedItem.componentType?.slice(1)} Component
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default DragDropPageEditor;
