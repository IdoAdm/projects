import React from 'react';
import type { PageComponent, HeroComponent, AboutComponent, ServicesComponent, TestimonialsComponent, PricingComponent, ContactComponent, BookingComponent, GalleryComponent, TextComponent, SpacerComponent, SocialComponent } from '../types/page-editor';

interface ComponentRendererProps {
  component: PageComponent;
  isEditing: boolean;
  onUpdate: (updates: Partial<PageComponent>) => void;
}

const HeroRenderer: React.FC<{ component: HeroComponent; isEditing: boolean; onUpdate: (updates: Partial<HeroComponent>) => void }> = ({ component }) => {
  const { content, styles } = component;
  
  return (
    <section 
      className="relative py-20 px-6"
      style={{
        backgroundColor: styles.backgroundColor || '#f8fafc',
        color: styles.textColor || '#1e293b',
        paddingTop: styles.padding?.top || 80,
        paddingBottom: styles.padding?.bottom || 80,
      }}
    >
      {content.backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${content.backgroundImage})` }}
        />
      )}
      <div className="relative max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          {content.title || 'Welcome to Your Wellness Journey'}
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-opacity-80">
          {content.subtitle || 'Transform your life with personalized wellness coaching'}
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
          {content.buttonText || 'Get Started'}
        </button>
      </div>
    </section>
  );
};

const AboutRenderer: React.FC<{ component: AboutComponent; isEditing: boolean; onUpdate: (updates: Partial<AboutComponent>) => void }> = ({ component }) => {
  const { content, styles } = component;
  
  return (
    <section 
      className="py-16 px-6"
      style={{
        backgroundColor: styles.backgroundColor || 'white',
        color: styles.textColor || '#1e293b',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className={`grid ${content.layout === 'text-only' ? 'grid-cols-1' : 'md:grid-cols-2'} gap-12 items-center`}>
          {content.layout !== 'text-only' && (
            <div className={content.layout === 'text-right' ? 'md:order-2' : ''}>
              <div className="bg-gray-200 rounded-lg aspect-square flex items-center justify-center">
                {content.image ? (
                  <img src={content.image} alt="About" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
            </div>
          )}
          <div className={content.layout === 'text-right' ? 'md:order-1' : ''}>
            <h2 className="text-3xl font-bold mb-6">
              {content.title || 'About Me'}
            </h2>
            <p className="text-lg leading-relaxed">
              {content.description || 'Certified wellness coach with over 10 years of experience helping clients achieve their health and wellness goals through personalized programs and holistic approaches.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const ServicesRenderer: React.FC<{ component: ServicesComponent; isEditing: boolean; onUpdate: (updates: Partial<ServicesComponent>) => void }> = ({ component }) => {
  const { content, styles } = component;
  
  return (
    <section 
      className="py-16 px-6"
      style={{
        backgroundColor: styles.backgroundColor || '#f8fafc',
        color: styles.textColor || '#1e293b',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          {content.title || 'My Services'}
        </h2>
        <div className={`grid gap-8 ${
          content.layout === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 
          content.layout === 'list' ? 'grid-cols-1' : 
          'md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {(content.services.length > 0 ? content.services : [
            { id: '1', name: 'Personal Training', description: 'One-on-one fitness coaching', price: '$80', duration: '60 min' },
            { id: '2', name: 'Yoga Classes', description: 'Group and private yoga sessions', price: '$25', duration: '90 min' },
            { id: '3', name: 'Nutrition Coaching', description: 'Personalized meal planning', price: '$60', duration: '45 min' },
          ]).map((service) => (
            <div key={service.id} className="bg-white rounded-lg p-6 shadow-md">
              {service.image && (
                <div className="mb-4">
                  <img src={service.image} alt={service.name} className="w-full h-40 object-cover rounded-lg" />
                </div>
              )}
              <h3 className="text-xl font-semibold mb-3">{service.name}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-blue-600">{service.price}</span>
                <span className="text-gray-500">{service.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const BookingRenderer: React.FC<{ component: BookingComponent; isEditing: boolean; onUpdate: (updates: Partial<BookingComponent>) => void }> = ({ component }) => {
  const { content, styles } = component;
  
  return (
    <section 
      className="py-16 px-6 text-center"
      style={{
        backgroundColor: styles.backgroundColor || '#3b82f6',
        color: styles.textColor || 'white',
      }}
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">
          {content.title || 'Ready to Start Your Journey?'}
        </h2>
        <p className="text-xl mb-8">
          {content.description || 'Book your consultation today and take the first step towards a healthier you.'}
        </p>
        <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
          {content.buttonText || 'Book Now'}
        </button>
      </div>
    </section>
  );
};

const TestimonialsRenderer: React.FC<{ component: TestimonialsComponent; isEditing: boolean; onUpdate: (updates: Partial<TestimonialsComponent>) => void }> = ({ component }) => {
  const { content, styles } = component;
  
  const testimonials = content.testimonials.length > 0 ? content.testimonials : [
    { id: '1', name: 'Sarah Johnson', text: 'Amazing results! Lost 20 pounds and feel stronger than ever.', rating: 5 },
    { id: '2', name: 'Mike Chen', text: 'Professional, knowledgeable, and truly cares about your success.', rating: 5 },
  ];
  
  return (
    <section 
      className="py-16 px-6"
      style={{
        backgroundColor: styles.backgroundColor || 'white',
        color: styles.textColor || '#1e293b',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          {content.title || 'What My Clients Say'}
        </h2>
        <div className={`grid gap-8 ${
          content.layout === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' :
          content.layout === 'single' ? 'grid-cols-1 max-w-4xl mx-auto' :
          'grid-cols-1'
        }`}>
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-gray-50 rounded-lg p-6">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-lg mb-4 italic">"{testimonial.text}"</p>
              <div className="flex items-center">
                {testimonial.image && (
                  <img src={testimonial.image} alt={testimonial.name} className="w-10 h-10 rounded-full mr-3" />
                )}
                <span className="font-semibold">{testimonial.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ContactRenderer: React.FC<{ component: ContactComponent; isEditing: boolean; onUpdate: (updates: Partial<ContactComponent>) => void }> = ({ component }) => {
  const { content, styles } = component;
  
  return (
    <section 
      className="py-16 px-6"
      style={{
        backgroundColor: styles.backgroundColor || '#f8fafc',
        color: styles.textColor || '#1e293b',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          {content.title || 'Get In Touch'}
        </h2>
        <div className={`grid gap-8 ${content.layout === 'side-by-side' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
          <div>
            <div className="space-y-6">
              {content.email && (
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{content.email}</span>
                </div>
              )}
              {content.phone && (
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{content.phone}</span>
                </div>
              )}
              {content.address && (
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{content.address}</span>
                </div>
              )}
            </div>
          </div>
          
          {content.layout === 'side-by-side' && content.showMap && (
            <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
              <span className="text-gray-500">Map placeholder</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const TextRenderer: React.FC<{ component: TextComponent; isEditing: boolean; onUpdate: (updates: Partial<TextComponent>) => void }> = ({ component }) => {
  const { content, styles } = component;
  
  return (
    <section 
      className="py-8 px-6"
      style={{
        backgroundColor: styles.backgroundColor || 'transparent',
        color: styles.textColor || '#1e293b',
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div 
          className={`prose max-w-none text-${content.alignment || 'left'}`}
          dangerouslySetInnerHTML={{ __html: content.html || '<p>Add your custom text here...</p>' }}
        />
      </div>
    </section>
  );
};

const SpacerRenderer: React.FC<{ component: SpacerComponent; isEditing: boolean; onUpdate: (updates: Partial<SpacerComponent>) => void }> = ({ component, isEditing }) => {
  return (
    <div 
      style={{ height: component.content.height || 40 }}
      className={isEditing ? 'bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center' : ''}
    >
      {isEditing && (
        <span className="text-sm text-gray-500">Spacer - {component.content.height || 40}px</span>
      )}
    </div>
  );
};

const SocialRenderer: React.FC<{ component: SocialComponent; isEditing: boolean; onUpdate: (updates: Partial<SocialComponent>) => void }> = ({ component }) => {
  const { content, styles } = component;
  
  const socialIcons = {
    instagram: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.329-1.297L6.537 14.5c.49.49 1.138.784 1.912.784 1.518 0 2.743-1.225 2.743-2.743S9.967 9.798 8.449 9.798s-2.743 1.225-2.743 2.743c0 .147.014.294.039.441l-1.191 1.176C4.202 13.539 4 12.784 4 11.987c0-4.41 3.607-8.017 8.017-8.017s8.017 3.607 8.017 8.017-3.607 8.017-8.017 8.017c-.784 0-1.539-.098-2.258-.294z" />
      </svg>
    ),
    facebook: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  };
  
  return (
    <section 
      className="py-12 px-6 text-center"
      style={{
        backgroundColor: styles.backgroundColor || 'white',
        color: styles.textColor || '#1e293b',
      }}
    >
      <div className="max-w-4xl mx-auto">
        {content.title && (
          <h2 className="text-2xl font-bold mb-8">{content.title}</h2>
        )}
        <div className="flex justify-center space-x-6">
          {Object.entries(content.links).filter(([_, url]) => url).map(([platform, url]) => (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              {socialIcons[platform as keyof typeof socialIcons] || (
                <span className="text-lg font-medium">{platform}</span>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

// Add missing component renderers for pricing and gallery
const PricingRenderer: React.FC<{ component: PricingComponent; isEditing: boolean; onUpdate: (updates: Partial<PricingComponent>) => void }> = ({ component }) => {
  const { content, styles } = component;
  
  const packages = content.packages.length > 0 ? content.packages : [
    { id: '1', name: 'Basic', price: '$49/mo', description: 'Perfect for beginners', features: ['2 sessions/month', 'Basic meal plan', 'Email support'], isPopular: false, buttonText: 'Get Started' },
    { id: '2', name: 'Premium', price: '$99/mo', description: 'Most popular choice', features: ['4 sessions/month', 'Custom meal plan', 'Phone support', 'Progress tracking'], isPopular: true, buttonText: 'Get Started' },
    { id: '3', name: 'Elite', price: '$199/mo', description: 'For serious athletes', features: ['Unlimited sessions', 'Personalized nutrition', '24/7 support', 'Recovery planning'], isPopular: false, buttonText: 'Get Started' },
  ];
  
  return (
    <section 
      className="py-16 px-6"
      style={{
        backgroundColor: styles.backgroundColor || 'white',
        color: styles.textColor || '#1e293b',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          {content.title || 'Choose Your Plan'}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div key={pkg.id} className={`rounded-lg p-6 ${pkg.isPopular ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50 border border-gray-200'}`}>
              {pkg.isPopular && (
                <div className="bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">{pkg.price}</div>
              <p className="text-gray-600 mb-6">{pkg.description}</p>
              <ul className="space-y-2 mb-6">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                pkg.isPopular 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}>
                {pkg.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const GalleryRenderer: React.FC<{ component: GalleryComponent; isEditing: boolean; onUpdate: (updates: Partial<GalleryComponent>) => void }> = ({ component }) => {
  const { content, styles } = component;
  
  const images = content.images.length > 0 ? content.images : [
    { id: '1', url: 'https://via.placeholder.com/400x300?text=Gallery+Image+1', alt: 'Gallery image 1' },
    { id: '2', url: 'https://via.placeholder.com/400x300?text=Gallery+Image+2', alt: 'Gallery image 2' },
    { id: '3', url: 'https://via.placeholder.com/400x300?text=Gallery+Image+3', alt: 'Gallery image 3' },
  ];
  
  return (
    <section 
      className="py-16 px-6"
      style={{
        backgroundColor: styles.backgroundColor || '#f8fafc',
        color: styles.textColor || '#1e293b',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          {content.title || 'Gallery'}
        </h2>
        <div className={`grid gap-4 ${
          content.layout === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' :
          content.layout === 'carousel' ? 'grid-cols-1' :
          'md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {images.map((image) => (
            <div key={image.id} className="overflow-hidden rounded-lg">
              <img 
                src={image.url} 
                alt={image.alt} 
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300" 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ComponentRenderer: React.FC<ComponentRendererProps> = ({ component, isEditing, onUpdate }) => {
  switch (component.type) {
    case 'hero':
      return <HeroRenderer component={component as HeroComponent} isEditing={isEditing} onUpdate={onUpdate as any} />;
    case 'about':
      return <AboutRenderer component={component as AboutComponent} isEditing={isEditing} onUpdate={onUpdate as any} />;
    case 'services':
      return <ServicesRenderer component={component as ServicesComponent} isEditing={isEditing} onUpdate={onUpdate as any} />;
    case 'booking':
      return <BookingRenderer component={component as BookingComponent} isEditing={isEditing} onUpdate={onUpdate as any} />;
    case 'testimonials':
      return <TestimonialsRenderer component={component as TestimonialsComponent} isEditing={isEditing} onUpdate={onUpdate as any} />;
    case 'pricing':
      return <PricingRenderer component={component as PricingComponent} isEditing={isEditing} onUpdate={onUpdate as any} />;
    case 'contact':
      return <ContactRenderer component={component as ContactComponent} isEditing={isEditing} onUpdate={onUpdate as any} />;
    case 'gallery':
      return <GalleryRenderer component={component as GalleryComponent} isEditing={isEditing} onUpdate={onUpdate as any} />;
    case 'text':
      return <TextRenderer component={component as TextComponent} isEditing={isEditing} onUpdate={onUpdate as any} />;
    case 'spacer':
      return <SpacerRenderer component={component as SpacerComponent} isEditing={isEditing} onUpdate={onUpdate as any} />;
    case 'social':
      return <SocialRenderer component={component as SocialComponent} isEditing={isEditing} onUpdate={onUpdate as any} />;
    default:
      const exhaustiveCheck: never = component;
      console.warn('Unknown component type', exhaustiveCheck);
      return null;
  }
};

export default ComponentRenderer;
