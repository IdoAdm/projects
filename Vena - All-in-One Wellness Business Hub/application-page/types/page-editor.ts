// Types for the new drag-and-drop page editor
export type ComponentType = 
  | 'hero'
  | 'about'
  | 'services'
  | 'testimonials'
  | 'pricing'
  | 'contact'
  | 'booking'
  | 'gallery'
  | 'text'
  | 'spacer'
  | 'social';

export interface BaseComponent {
  id: string;
  type: ComponentType;
  order: number;
  isVisible: boolean;
  styles: {
    backgroundColor?: string;
    textColor?: string;
    padding?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    margin?: {
      top: number;
      bottom: number;
    };
  };
}

export interface HeroComponent extends BaseComponent {
  type: 'hero';
  content: {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonUrl: string;
    backgroundImage?: string;
    layout: 'center' | 'left' | 'right';
  };
}

export interface AboutComponent extends BaseComponent {
  type: 'about';
  content: {
    title: string;
    description: string;
    image?: string;
    layout: 'text-left' | 'text-right' | 'text-only';
  };
}

export interface ServicesComponent extends BaseComponent {
  type: 'services';
  content: {
    title: string;
    services: Array<{
      id: string;
      name: string;
      description: string;
      price: string;
      duration: string;
      image?: string;
    }>;
    layout: 'grid' | 'list' | 'cards';
  };
}

export interface TestimonialsComponent extends BaseComponent {
  type: 'testimonials';
  content: {
    title: string;
    testimonials: Array<{
      id: string;
      name: string;
      text: string;
      rating: number;
      image?: string;
    }>;
    layout: 'carousel' | 'grid' | 'single';
  };
}

export interface PricingComponent extends BaseComponent {
  type: 'pricing';
  content: {
    title: string;
    packages: Array<{
      id: string;
      name: string;
      price: string;
      description: string;
      features: string[];
      isPopular: boolean;
      buttonText: string;
    }>;
    layout: 'cards' | 'table';
  };
}

export interface ContactComponent extends BaseComponent {
  type: 'contact';
  content: {
    title: string;
    email: string;
    phone: string;
    address?: string;
    socialLinks: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
      linkedin?: string;
    };
    showMap: boolean;
    layout: 'side-by-side' | 'stacked';
  };
}

export interface BookingComponent extends BaseComponent {
  type: 'booking';
  content: {
    title: string;
    buttonText: string;
    description: string;
    reservekitIntegration: boolean;
  };
}

export interface GalleryComponent extends BaseComponent {
  type: 'gallery';
  content: {
    title: string;
    images: Array<{
      id: string;
      url: string;
      alt: string;
    }>;
    layout: 'masonry' | 'grid' | 'carousel';
  };
}

export interface TextComponent extends BaseComponent {
  type: 'text';
  content: {
    html: string;
    alignment: 'left' | 'center' | 'right';
  };
}

export interface SpacerComponent extends BaseComponent {
  type: 'spacer';
  content: {
    height: number; // in pixels
  };
}

export interface SocialComponent extends BaseComponent {
  type: 'social';
  content: {
    title: string;
    links: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      youtube?: string;
      tiktok?: string;
    };
    style: 'buttons' | 'icons' | 'text';
  };
}

export type PageComponent = 
  | HeroComponent
  | AboutComponent
  | ServicesComponent
  | TestimonialsComponent
  | PricingComponent
  | ContactComponent
  | BookingComponent
  | GalleryComponent
  | TextComponent
  | SpacerComponent
  | SocialComponent;

export interface PageLayout {
  id: string;
  userId: string;
  name: string;
  components: PageComponent[];
  settings: {
    theme: {
      primaryColor: string;
      secondaryColor: string;
      fontFamily: string;
      fontSize: 'small' | 'medium' | 'large';
    };
    seo: {
      title: string;
      description: string;
      keywords: string[];
    };
    customCss?: string;
  };
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EditorState {
  currentPage: PageLayout | null;
  selectedComponentId: string | null;
  draggedComponentType: ComponentType | null;
  previewMode: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

export interface DragItem {
  type: 'component';
  componentType: ComponentType;
  id?: string; // for existing components
}