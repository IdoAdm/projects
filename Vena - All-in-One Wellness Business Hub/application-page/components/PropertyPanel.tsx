import React, { useState } from 'react';
import type { PageComponent, HeroComponent, AboutComponent, ContactComponent, BookingComponent, TextComponent, SpacerComponent } from '../types/page-editor';

interface PropertyPanelProps {
  selectedComponent: PageComponent | null;
  onUpdateComponent: (updates: Partial<PageComponent>) => void;
  onDeleteComponent: () => void;
  className?: string;
}

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  const presetColors = [
    '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0',
    '#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a',
    '#10b981', '#059669', '#047857', '#065f46',
    '#f59e0b', '#d97706', '#b45309', '#92400e',
    '#ef4444', '#dc2626', '#b91c1c', '#991b1b',
    '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6',
  ];

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={value || '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded border border-gray-300"
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#ffffff"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <div className="grid grid-cols-8 gap-1 mt-2">
        {presetColors.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
};

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ label, value, onChange, placeholder, multiline }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {multiline ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      )}
    </div>
  );
};

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const NumberInput: React.FC<NumberInputProps> = ({ label, value, onChange, min = 0, max = 1000, step = 1 }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type="number"
        value={value || 0}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
      />
    </div>
  );
};

interface SelectInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

const SelectInput: React.FC<SelectInputProps> = ({ label, value, onChange, options }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        value={value || options[0]?.value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const HeroProperties: React.FC<{ component: HeroComponent; onUpdate: (updates: Partial<HeroComponent>) => void }> = ({ component, onUpdate }) => {
  return (
    <div>
      <TextInput
        label="Title"
        value={component.content.title}
        onChange={(title) => onUpdate({ content: { ...component.content, title } })}
        placeholder="Welcome to Your Wellness Journey"
      />
      <TextInput
        label="Subtitle"
        value={component.content.subtitle}
        onChange={(subtitle) => onUpdate({ content: { ...component.content, subtitle } })}
        placeholder="Transform your life..."
        multiline
      />
      <TextInput
        label="Button Text"
        value={component.content.buttonText}
        onChange={(buttonText) => onUpdate({ content: { ...component.content, buttonText } })}
        placeholder="Get Started"
      />
      <TextInput
        label="Button URL"
        value={component.content.buttonUrl}
        onChange={(buttonUrl) => onUpdate({ content: { ...component.content, buttonUrl } })}
        placeholder="https://example.com/book"
      />
      <SelectInput
        label="Layout"
        value={component.content.layout}
        onChange={(layout) => onUpdate({ content: { ...component.content, layout: layout as any } })}
        options={[
          { value: 'center', label: 'Center' },
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' },
        ]}
      />
      <TextInput
        label="Background Image URL"
        value={component.content.backgroundImage || ''}
        onChange={(backgroundImage) => onUpdate({ content: { ...component.content, backgroundImage } })}
        placeholder="https://example.com/image.jpg"
      />
    </div>
  );
};

const AboutProperties: React.FC<{ component: AboutComponent; onUpdate: (updates: Partial<AboutComponent>) => void }> = ({ component, onUpdate }) => {
  return (
    <div>
      <TextInput
        label="Title"
        value={component.content.title}
        onChange={(title) => onUpdate({ content: { ...component.content, title } })}
        placeholder="About Me"
      />
      <TextInput
        label="Description"
        value={component.content.description}
        onChange={(description) => onUpdate({ content: { ...component.content, description } })}
        placeholder="Tell your story..."
        multiline
      />
      <SelectInput
        label="Layout"
        value={component.content.layout}
        onChange={(layout) => onUpdate({ content: { ...component.content, layout: layout as any } })}
        options={[
          { value: 'text-left', label: 'Image Right' },
          { value: 'text-right', label: 'Image Left' },
          { value: 'text-only', label: 'Text Only' },
        ]}
      />
      <TextInput
        label="Image URL"
        value={component.content.image || ''}
        onChange={(image) => onUpdate({ content: { ...component.content, image } })}
        placeholder="https://example.com/image.jpg"
      />
    </div>
  );
};

const BookingProperties: React.FC<{ component: BookingComponent; onUpdate: (updates: Partial<BookingComponent>) => void }> = ({ component, onUpdate }) => {
  return (
    <div>
      <TextInput
        label="Title"
        value={component.content.title}
        onChange={(title) => onUpdate({ content: { ...component.content, title } })}
        placeholder="Ready to Start Your Journey?"
      />
      <TextInput
        label="Description"
        value={component.content.description}
        onChange={(description) => onUpdate({ content: { ...component.content, description } })}
        placeholder="Book your consultation today..."
        multiline
      />
      <TextInput
        label="Button Text"
        value={component.content.buttonText}
        onChange={(buttonText) => onUpdate({ content: { ...component.content, buttonText } })}
        placeholder="Book Now"
      />
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={component.content.reservekitIntegration}
            onChange={(e) => onUpdate({ content: { ...component.content, reservekitIntegration: e.target.checked } })}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700">Enable ReserveKit Integration</span>
        </label>
      </div>
    </div>
  );
};

const TextProperties: React.FC<{ component: TextComponent; onUpdate: (updates: Partial<TextComponent>) => void }> = ({ component, onUpdate }) => {
  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
        <textarea
          value={component.content.html}
          onChange={(e) => onUpdate({ content: { ...component.content, html: e.target.value } })}
          placeholder="<p>Add your custom text here...</p>"
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">You can use HTML tags for formatting</p>
      </div>
      <SelectInput
        label="Alignment"
        value={component.content.alignment}
        onChange={(alignment) => onUpdate({ content: { ...component.content, alignment: alignment as any } })}
        options={[
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ]}
      />
    </div>
  );
};

const SpacerProperties: React.FC<{ component: SpacerComponent; onUpdate: (updates: Partial<SpacerComponent>) => void }> = ({ component, onUpdate }) => {
  return (
    <div>
      <NumberInput
        label="Height (px)"
        value={component.content.height}
        onChange={(height) => onUpdate({ content: { ...component.content, height } })}
        min={10}
        max={500}
        step={10}
      />
    </div>
  );
};

const ContactProperties: React.FC<{ component: ContactComponent; onUpdate: (updates: Partial<ContactComponent>) => void }> = ({ component, onUpdate }) => {
  return (
    <div>
      <TextInput
        label="Title"
        value={component.content.title}
        onChange={(title) => onUpdate({ content: { ...component.content, title } })}
        placeholder="Get In Touch"
      />
      <TextInput
        label="Email"
        value={component.content.email}
        onChange={(email) => onUpdate({ content: { ...component.content, email } })}
        placeholder="hello@example.com"
      />
      <TextInput
        label="Phone"
        value={component.content.phone}
        onChange={(phone) => onUpdate({ content: { ...component.content, phone } })}
        placeholder="+1 (555) 123-4567"
      />
      <TextInput
        label="Address"
        value={component.content.address || ''}
        onChange={(address) => onUpdate({ content: { ...component.content, address } })}
        placeholder="123 Wellness St, Health City"
        multiline
      />
      <SelectInput
        label="Layout"
        value={component.content.layout}
        onChange={(layout) => onUpdate({ content: { ...component.content, layout: layout as any } })}
        options={[
          { value: 'side-by-side', label: 'Side by Side' },
          { value: 'stacked', label: 'Stacked' },
        ]}
      />
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={component.content.showMap}
            onChange={(e) => onUpdate({ content: { ...component.content, showMap: e.target.checked } })}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700">Show Map</span>
        </label>
      </div>
    </div>
  );
};

const PropertyPanel: React.FC<PropertyPanelProps> = ({ selectedComponent, onUpdateComponent, onDeleteComponent, className = '' }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'style'>('content');

  if (!selectedComponent) {
    return (
      <div className={`bg-white border-l border-gray-200 p-6 ${className}`}>
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Component Selected</h3>
          <p className="text-gray-500 text-sm">
            Click on a component in your page to edit its properties.
          </p>
        </div>
      </div>
    );
  }

  const renderContentProperties = () => {
    switch (selectedComponent.type) {
      case 'hero':
        return <HeroProperties component={selectedComponent as HeroComponent} onUpdate={onUpdateComponent} />;
      case 'about':
        return <AboutProperties component={selectedComponent as AboutComponent} onUpdate={onUpdateComponent} />;
      case 'booking':
        return <BookingProperties component={selectedComponent as BookingComponent} onUpdate={onUpdateComponent} />;
      case 'text':
        return <TextProperties component={selectedComponent as TextComponent} onUpdate={onUpdateComponent} />;
      case 'spacer':
        return <SpacerProperties component={selectedComponent as SpacerComponent} onUpdate={onUpdateComponent} />;
      case 'contact':
        return <ContactProperties component={selectedComponent as ContactComponent} onUpdate={onUpdateComponent} />;
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              Properties for {selectedComponent.type} component coming soon!
            </p>
          </div>
        );
    }
  };

  const renderStyleProperties = () => {
    return (
      <div>
        <ColorPicker
          label="Background Color"
          value={selectedComponent.styles.backgroundColor || '#ffffff'}
          onChange={(backgroundColor) => 
            onUpdateComponent({ 
              styles: { ...selectedComponent.styles, backgroundColor } 
            })
          }
        />
        <ColorPicker
          label="Text Color"
          value={selectedComponent.styles.textColor || '#1e293b'}
          onChange={(textColor) => 
            onUpdateComponent({ 
              styles: { ...selectedComponent.styles, textColor } 
            })
          }
        />
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Padding</h4>
          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              label="Top"
              value={selectedComponent.styles.padding?.top || 0}
              onChange={(top) => 
                onUpdateComponent({ 
                  styles: { 
                    ...selectedComponent.styles, 
                    padding: { 
                      top: top,
                      bottom: selectedComponent.styles.padding?.bottom || 0,
                      left: selectedComponent.styles.padding?.left || 0,
                      right: selectedComponent.styles.padding?.right || 0
                    } 
                  } 
                })
              }
              min={0}
              max={200}
              step={5}
            />
            <NumberInput
              label="Bottom"
              value={selectedComponent.styles.padding?.bottom || 0}
              onChange={(bottom) => 
                onUpdateComponent({ 
                  styles: { 
                    ...selectedComponent.styles, 
                    padding: { 
                      top: selectedComponent.styles.padding?.top || 0,
                      bottom: bottom,
                      left: selectedComponent.styles.padding?.left || 0,
                      right: selectedComponent.styles.padding?.right || 0
                    } 
                  } 
                })
              }
              min={0}
              max={200}
              step={5}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white border-l border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {selectedComponent.type.charAt(0).toUpperCase() + selectedComponent.type.slice(1)} Component
          </h3>
          <button
            onClick={onDeleteComponent}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete component"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex mt-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'content'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('style')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'style'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Style
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'content' ? renderContentProperties() : renderStyleProperties()}
      </div>

      {/* Visibility Toggle */}
      <div className="border-t border-gray-200 p-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={selectedComponent.isVisible}
            onChange={(e) => onUpdateComponent({ isVisible: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700">
            Component Visible
          </span>
        </label>
      </div>
    </div>
  );
};

export default PropertyPanel;