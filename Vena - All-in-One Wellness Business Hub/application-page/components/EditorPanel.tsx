import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ProfileConfig, FontThemeKey, SectionId, LoungeConfig, LoungePost } from '../index';
import { TEMPLATES } from '../constants/config';
import { FONT_THEMES, COLOR_PALETTE } from '../constants/themes';
import { createEmptyLoungePost } from '../lib/lounge';

// --- ICONS ---
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>);
const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>);
const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>);
const ChevronUpIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>);
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>);
const LayoutIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
  
  const PaletteIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  );
  
  const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.2 3.6L17 7.5l-3 2.3L15 13l-3-2-3 2 .9-3.2-3-2.3 3.8-.9L12 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l.6 1.8L7 17l-1.4 1 .4 1.6L5 18.6l-1 1 .4-1.6L3 17l1.4-.2L5 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 15.5l.4 1.2L20.5 17l-1 .7.3 1.1L19 18l-.8.8.3-1.1-1-.7 1.1-.3L19 15.5z" />
    </svg>
  );

interface AccordionItemProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, isOpen, onToggle, children, icon }) => (
    <div>
      <button 
        onClick={onToggle} 
        className={`w-full flex justify-between items-center p-6 text-left transition-all duration-300 ease-out group
          ${isOpen 
            ? 'bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30' 
            : 'hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-gray-50/50 dark:hover:from-slate-800/30 dark:hover:to-gray-800/30'
          }
          border-b border-slate-100/60 dark:border-slate-700/60 backdrop-blur-sm`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg transition-all duration-300 ${
            isOpen 
              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' 
              : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-600/50'
          }`}>
            {icon}
          </div>
          <span className={`font-medium text-lg tracking-tight transition-colors duration-200 ${
            isOpen 
              ? 'text-slate-900 dark:text-slate-100' 
              : 'text-slate-700 dark:text-slate-300'
          }`}>
            {title}
          </span>
        </div>
        <ChevronDownIcon className={`w-5 h-5 transform transition-all duration-300 ease-out ${
          isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
        }`} />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 pt-2 bg-gradient-to-b from-white/50 to-slate-50/30 dark:from-slate-800/20 dark:to-slate-900/10 backdrop-blur-sm">
          <div className="animate-fadeIn">
            {children}
          </div>
        </div>
      )}
    </div>
  );

interface EditorPanelProps {
  isPreviewMode: boolean;
  config: ProfileConfig;
  language: 'en' | 'he';
  onTemplateChange: (templateKey: string) => void;
  onStyleChange: <K extends keyof ProfileConfig['styles']>(key: K, value: ProfileConfig['styles'][K]) => void;
  onFontThemeChange: (themeKey: FontThemeKey) => void;
  onValueChange: <K extends keyof ProfileConfig>(key: K, value: ProfileConfig[K]) => void;
  onSectionVisibilityChange: (sectionId: SectionId, isVisible: boolean) => void;
  onSectionsOrderChange: (sections: SectionId[]) => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  isPreviewMode,
  config,
  language,
  onTemplateChange,
  onStyleChange,
  onFontThemeChange,
  onValueChange,
  onSectionVisibilityChange,
  onSectionsOrderChange,
}) => {
  const [openAccordions, setOpenAccordions] = useState(['Templates']);
  const [showCustomPrimary, setShowCustomPrimary] = useState(false);
  const [showCustomSecondary, setShowCustomSecondary] = useState(false);
  const [showCustomBackground, setShowCustomBackground] = useState(false);

  const loungeEnabled = config.sectionVisibility.lounge !== false;

  const ensureLoungeInSections = () => {
    if (!config.sections.includes('lounge')) {
      const next: SectionId[] = [...config.sections, 'lounge'];
      onSectionsOrderChange(next);
    }
  };

  const updateLounge = (updater: (prev: LoungeConfig) => LoungeConfig) => {
    const next = updater(config.lounge);
    onValueChange('lounge', next);
  };

  const handleLoungeFieldChange = <K extends keyof LoungeConfig>(key: K, value: LoungeConfig[K]) => {
    updateLounge((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePostChange = (postId: string, patch: Partial<LoungePost>) => {
    updateLounge((prev) => ({
      ...prev,
      posts: prev.posts.map((post) =>
        post.id === postId ? { ...post, ...patch } : post
      ),
    }));
  };

  const handleAddPost = () => {
    const newPost = createEmptyLoungePost(config);

    updateLounge((prev) => ({
      ...prev,
      posts: [newPost, ...prev.posts],
    }));

    ensureLoungeInSections();
    onSectionVisibilityChange('lounge', true);
  };

  const handleRemovePost = (postId: string) => {
    updateLounge((prev) => ({
      ...prev,
      posts: prev.posts.filter((post) => post.id !== postId),
    }));
  };

  const handleMovePost = (postId: string, direction: 'up' | 'down') => {
    updateLounge((prev) => {
      const index = prev.posts.findIndex((post) => post.id === postId);
      if (index === -1) return prev;
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= prev.posts.length) return prev;
      const posts = [...prev.posts];
      const [moved] = posts.splice(index, 1);
      posts.splice(target, 0, moved);
      return { ...prev, posts };
    });
  };

  const handleTogglePinned = (postId: string, pinned: boolean) => {
    handlePostChange(postId, { pinned });
  };

  const handleLoungeVisibilityChange = (enabled: boolean) => {
    onSectionVisibilityChange('lounge', enabled);
    if (enabled) {
      ensureLoungeInSections();
    }
  };

  const handleMoveLoungeSection = (direction: 'up' | 'down') => {
    const order: SectionId[] = config.sections.includes('lounge')
      ? [...config.sections]
      : [...config.sections, 'lounge'];
    const currentIndex = order.indexOf('lounge');
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? Math.max(0, currentIndex - 1) : Math.min(order.length - 1, currentIndex + 1);
    if (targetIndex === currentIndex) return;
    order.splice(currentIndex, 1);
    order.splice(targetIndex, 0, 'lounge');
    onSectionsOrderChange(order);
  };

  const toDatetimeLocal = (value: string) => {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    const pad = (input: number) => input.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const fromDatetimeLocal = (value: string, fallback: string) => {
    if (!value) {
      return fallback;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return fallback;
    }
    return parsed.toISOString();
  };

  const locale = language === 'he' ? 'he-IL' : 'en-US';
  const loungePosts = config.lounge.posts ?? [];

  const [panelWidth, setPanelWidth] = useState(384); // Default width w-96
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && panelRef.current) {
      const newWidth = e.clientX;
      if (newWidth > 250 && newWidth < 800) { // Min/max width constraints
        setPanelWidth(newWidth);
      }
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    setPanelWidth(isCollapsed ? 384 : 0);
  };
  
  const handleAccordionToggle = (title: string) => {
    setOpenAccordions(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title) 
        : [...prev, title]
    );
  };
  const languageFilteredFontThemes = Object.entries(FONT_THEMES).filter(([, theme]) => (theme.lang as readonly string[]).includes(language));

  // Enhanced Color Picker Component
  const ColorPicker: React.FC<{
    colors: Array<{ class: string; name: string; hex: string }>;
    selectedColor: string;
    onColorChange: (color: string) => void;
    showCustom: boolean;
    onToggleCustom: (show: boolean) => void;
    type: 'primary' | 'secondary' | 'background';
  }> = ({ colors, selectedColor, onColorChange, showCustom, onToggleCustom, type }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-3">
        {colors.map(({ class: colorClass, name, hex }) => (
          <div key={colorClass} className="relative group">
            <button
              onClick={() => onColorChange(colorClass)}
              className={`w-10 h-10 rounded-xl ${colorClass} border-2 transition-all duration-300 ease-out
                ${selectedColor === colorClass 
                  ? 'border-blue-500 shadow-lg shadow-blue-500/30 scale-110 ring-2 ring-blue-200/50 dark:ring-blue-500/30' 
                  : type === 'background' 
                    ? 'border-slate-200/60 dark:border-slate-600/50 hover:border-slate-300/80 dark:hover:border-slate-500/70' 
                    : 'border-transparent hover:border-slate-200/60 dark:hover:border-slate-600/50'
                } hover:scale-105 hover:shadow-md`}
              title={`${name} (${hex})`}
            >
              {type === 'secondary' && (
                <span className={`${colorClass} text-xs font-bold flex items-center justify-center h-full rounded-xl`}>
                  Aa
                </span>
              )}
            </button>
            {/* Enhanced Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-slate-900/95 dark:bg-slate-800/95 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-20 backdrop-blur-sm shadow-xl">
              <div className="font-medium">{name}</div>
              <div className="font-mono text-slate-300 dark:text-slate-400">{hex}</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-900/95 dark:bg-slate-800/95 rotate-45"></div>
            </div>
          </div>
        ))}
        {/* Enhanced Custom Color Button */}
        <button
          onClick={() => onToggleCustom(!showCustom)}
          className={`w-10 h-10 rounded-xl border-2 border-dashed transition-all duration-300 ease-out flex items-center justify-center text-lg font-light
            ${showCustom 
              ? 'border-blue-400 dark:border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20' 
              : 'border-slate-300/60 dark:border-slate-600/50 text-slate-400 dark:text-slate-500 hover:border-slate-400/80 dark:hover:border-slate-500/70 hover:text-slate-600 dark:hover:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-slate-700/30'
            }`}
          title="Custom Color"
        >
          +
        </button>
      </div>
      {/* Enhanced Custom Color Input */}
      {showCustom && (
        <div className="mt-4 p-4 bg-gradient-to-r from-slate-50/80 to-white/60 dark:from-slate-700/60 dark:to-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-600/40 backdrop-blur-sm">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Custom {type} color
          </label>
          <input
            type="text"
            placeholder={type === 'primary' ? 'bg-red-500 or #FF0000' : type === 'secondary' ? 'text-red-500 or #FF0000' : 'bg-red-50 or #FFF0F0'}
            className="w-full px-4 py-3 text-sm border border-slate-200/60 dark:border-slate-600/50 rounded-lg bg-white/80 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300/60 dark:focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const value = (e.target as HTMLInputElement).value.trim();
                if (value) {
                  onColorChange(value);
                  onToggleCustom(false);
                }
              }
            }}
            onBlur={(e) => {
              const value = e.target.value.trim();
              if (value) {
                onColorChange(value);
                onToggleCustom(false);
              }
            }}
          />
        </div>
      )}
    </div>
  );

  // Word-Style Font Picker Component
  const FontPicker: React.FC<{
    fontThemes: Array<[string, any]>;
    selectedFont: string;
    onFontChange: (fontKey: FontThemeKey) => void;
    language: 'en' | 'he';
  }> = ({ fontThemes, selectedFont, onFontChange, language }) => {
    
    // Extract main font family from the theme strings
    const getFontFamily = (fontString: string) => {
      const match = fontString.match(/font-family:([^;,]+)/);
      return match ? match[1].replace(/['"]/g, '').trim() : 'inherit';
    };

    return (
      <div className="border border-slate-200/60 dark:border-slate-600/50 rounded-lg bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm">
        {fontThemes.map(([key, theme], index) => (
          <button
            key={key}
            onClick={() => onFontChange(key as FontThemeKey)}
            className={`w-full px-4 py-3 text-left transition-all duration-200 ease-out flex items-center justify-between group
              ${selectedFont === key 
                ? 'bg-blue-500 dark:bg-blue-600 text-white' 
                : 'hover:bg-slate-50/80 dark:hover:bg-slate-700/60 text-slate-900 dark:text-slate-100'
              }
              ${index === 0 ? 'rounded-t-lg' : ''}
              ${index === fontThemes.length - 1 ? 'rounded-b-lg' : 'border-b border-slate-200/40 dark:border-slate-600/40'}
            `}
          >
            <span 
              className="text-base font-normal tracking-normal"
              style={{ 
                fontFamily: getFontFamily(theme.heading),
                fontSize: '16px'
              }}
            >
              {theme.name[language]}
            </span>
            {selectedFont === key && (
              <CheckIcon className="w-4 h-4 text-white flex-shrink-0" />
            )}
          </button>
        ))}
      </div>
    );
  };

  // const getButtonText = () => {
  //   switch (status) {
  //     case 'saving':
  //       return 'Saving...';
  //     case 'success':
  //       return 'Saved!';
  //     case 'error':
  //       return 'Save Failed';
  //     default:
  //       return 'Save Changes';
  //   }
  // };

  return (
    <aside 
      ref={panelRef}
      className={`relative flex-shrink-0 transition-all duration-500 ease-out ${isPreviewMode ? 'ml-[-' + panelWidth + 'px]' : 'ml-0'}
        bg-gradient-to-br from-white via-slate-50/80 to-gray-50/60
        dark:from-slate-900 dark:via-slate-800/90 dark:to-gray-900/80
        backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-700/50
        shadow-xl shadow-slate-200/20 dark:shadow-slate-900/30`}
      style={{ width: isCollapsed ? 0 : panelWidth }}
    >
      {/* Collapse/Expand Button - Top positioned and larger */}
      <button
        onClick={toggleCollapse}
        className="absolute top-4 -right-5 z-30 w-10 h-10 
          bg-gradient-to-r from-white/95 to-slate-50/90
          dark:from-slate-800/95 dark:to-slate-700/90
          border-2 border-slate-200/70 dark:border-slate-600/60
          rounded-full shadow-xl shadow-slate-200/40 dark:shadow-slate-900/50
          flex items-center justify-center 
          hover:from-blue-50/95 hover:to-indigo-50/90
          dark:hover:from-blue-900/50 dark:hover:to-indigo-900/40
          hover:border-blue-300/70 dark:hover:border-blue-500/60
          hover:shadow-blue-200/40 dark:hover:shadow-blue-900/50
          hover:scale-110 active:scale-95
          transition-all duration-200 ease-out group backdrop-blur-sm"
        title={isCollapsed ? "Expand Panel" : "Collapse Panel"}
      >
        {isCollapsed ? (
          <ChevronRightIcon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
        ) : (
          <ChevronLeftIcon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
        )}
      </button>

      {/* Panel Content */}
      <div className={`h-full ${isCollapsed ? 'hidden' : 'block'}`}>
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100/60 dark:border-slate-700/50 bg-gradient-to-r from-white/60 to-slate-50/40 dark:from-slate-800/60 dark:to-slate-900/40 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">Editor</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Customize your profile</p>
            </div>
          </div>
        </div>

        <div className="p-6 h-full overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            <AccordionItem 
              title="Templates" 
              isOpen={openAccordions.includes('Templates')} 
              onToggle={() => handleAccordionToggle('Templates')}
              icon={<LayoutIcon className="w-5 h-5" />}
            >
              <div className="grid grid-cols-2 gap-3 mt-4">
                {['scratch', ...Object.keys(TEMPLATES)].map(t => (
                  <button 
                    key={t} 
                    onClick={() => onTemplateChange(t)} 
                    className={`px-4 py-3 text-sm font-medium capitalize rounded-xl border transition-all duration-300 ease-out
                      ${config.templateId === t 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-500/30 transform scale-105' 
                        : 'bg-white/80 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-600/50 hover:border-blue-300/60 dark:hover:border-blue-500/50 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/60 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 hover:shadow-md hover:shadow-blue-200/20 dark:hover:shadow-blue-900/20 backdrop-blur-sm'
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </AccordionItem>
            <AccordionItem 
              title="Members Lounge" 
              isOpen={openAccordions.includes('Members Lounge')} 
              onToggle={() => handleAccordionToggle('Members Lounge')}
              icon={<SparklesIcon className="w-5 h-5" />}
            >
              <div className="space-y-6 mt-4">
                <div className="bg-white/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/50 rounded-2xl p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        Section visibility
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Toggle whether the lounge is shown on your live page.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
                          checked={loungeEnabled}
                          onChange={(event) => handleLoungeVisibilityChange(event.target.checked)}
                        />
                        Show lounge on profile
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleMoveLoungeSection('up')}
                          className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700 hover:border-slate-300 transition"
                        >
                          Move up
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveLoungeSection('down')}
                          className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700 hover:border-slate-300 transition"
                        >
                          Move down
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="bg-white/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/50 rounded-2xl p-5">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                      Headline
                    </label>
                    <input
                      type="text"
                      value={config.lounge.headline}
                      onChange={(event) => handleLoungeFieldChange('headline', event.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="Members' Lounge"
                    />
                  </div>

                  <div className="bg-white/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/50 rounded-2xl p-5">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                      Intro description
                    </label>
                    <textarea
                      value={config.lounge.description}
                      onChange={(event) => handleLoungeFieldChange('description', event.target.value)}
                      className="w-full min-h-[80px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="Explain how you use the lounge with clients..."
                    />
                  </div>

                  <div className="bg-white/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/50 rounded-2xl p-5">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                      Search placeholder
                    </label>
                    <input
                      type="text"
                      value={config.lounge.searchPlaceholder}
                      onChange={(event) => handleLoungeFieldChange('searchPlaceholder', event.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="Search posts, tags, or authors..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      Posts ({loungePosts.length})
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Create updates, playlists, or celebrations for your members.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPost}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow hover:bg-slate-800 transition"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                    Add post
                  </button>
                </div>

                <div className="space-y-5">
                  {loungePosts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center text-sm text-slate-500">
                      No lounge posts yet. Add your first update to welcome members.
                    </div>
                  ) : (
                    loungePosts.map((post, index) => {
                      const tagValue = (post.tags ?? []).join(', ');
                      const createdDisplay = (() => {
                        if (!post.createdAt) {
                          return 'Not set';
                        }
                        const date = new Date(post.createdAt);
                        if (Number.isNaN(date.getTime())) {
                          return 'Not set';
                        }
                        return date.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
                      })();
                      return (
                        <div
                          key={post.id}
                          className="rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm"
                        >
                          <div className="flex flex-col gap-3 border-b border-slate-200/60 dark:border-slate-700/50 px-5 py-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Post {index + 1}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                Created {createdDisplay}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                  checked={!!post.pinned}
                                  onChange={(event) => handleTogglePinned(post.id, event.target.checked)}
                                />
                                Pinned
                              </label>
                              <div className="hidden md:flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMovePost(post.id, 'up')}
                                  disabled={index === 0}
                                  className="rounded-full border border-slate-200 p-1 text-slate-500 hover:text-slate-700 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                  <ChevronUpIcon className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMovePost(post.id, 'down')}
                                  disabled={index === loungePosts.length - 1}
                                  className="rounded-full border border-slate-200 p-1 text-slate-500 hover:text-slate-700 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                  <ChevronDownIcon className="h-4 w-4" />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemovePost(post.id)}
                                className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600 hover:bg-rose-50 transition"
                              >
                                Remove
                              </button>
                            </div>
                          </div>

                          <div className="px-5 py-5 space-y-5">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Post title
                                </label>
                                <input
                                  type="text"
                                  value={post.title}
                                  onChange={(event) => handlePostChange(post.id, { title: event.target.value })}
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                  placeholder="Weekly focus or headline"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Published at
                                </label>
                                <input
                                  type="datetime-local"
                                  value={toDatetimeLocal(post.createdAt)}
                                  onChange={(event) =>
                                    handlePostChange(post.id, { createdAt: fromDatetimeLocal(event.target.value, post.createdAt) })
                                  }
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Summary
                              </label>
                              <textarea
                                value={post.body}
                                onChange={(event) => handlePostChange(post.id, { body: event.target.value })}
                                className="w-full min-h-[90px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                placeholder="Describe the update and why it matters..."
                              />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Author name
                                </label>
                                <input
                                  type="text"
                                  value={post.authorName}
                                  onChange={(event) => handlePostChange(post.id, { authorName: event.target.value })}
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Author role
                                </label>
                                <input
                                  type="text"
                                  value={post.authorRole}
                                  onChange={(event) => handlePostChange(post.id, { authorRole: event.target.value })}
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                              </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Cover image URL
                                </label>
                                <input
                                  type="url"
                                  value={post.coverImageUrl ?? ''}
                                  onChange={(event) => handlePostChange(post.id, { coverImageUrl: event.target.value })}
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                  placeholder="https://"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Author avatar URL
                                </label>
                                <input
                                  type="url"
                                  value={post.authorAvatarUrl ?? ''}
                                  onChange={(event) => handlePostChange(post.id, { authorAvatarUrl: event.target.value })}
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                  placeholder="https://"
                                />
                              </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Tags
                                </label>
                                <input
                                  type="text"
                                  value={tagValue}
                                  onChange={(event) => {
                                    const raw = event.target.value;
                                    const tags = raw.split(',').map(tag => tag.trim()).filter(Boolean);
                                    handlePostChange(post.id, { tags });
                                  }}
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                  placeholder="breathwork, community, playlist"
                                />
                                <p className="text-[11px] text-slate-400">
                                  Separate tags with commas.
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Likes
                                  </label>
                                  <input
                                    type="number"
                                    min={0}
                                    value={post.likes ?? 0}
                                    onChange={(event) => handlePostChange(post.id, { likes: Math.max(0, Number(event.target.value) || 0) })}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Saves
                                  </label>
                                  <input
                                    type="number"
                                    min={0}
                                    value={post.saves ?? 0}
                                    onChange={(event) => handlePostChange(post.id, { saves: Math.max(0, Number(event.target.value) || 0) })}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </AccordionItem>
            <AccordionItem 
              title="Appearance" 
              isOpen={openAccordions.includes('Appearance')} 
              onToggle={() => handleAccordionToggle('Appearance')}
              icon={<PaletteIcon className="w-5 h-5" />}
            >
              <div className="space-y-8 mt-6">
                <div className="bg-white/60 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-100/60 dark:border-slate-700/40 backdrop-blur-sm shadow-sm">
                  <label className="flex items-center gap-3 text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                    Font Selection
                  </label>
                  <FontPicker
                    fontThemes={languageFilteredFontThemes}
                    selectedFont={config.styles.fontPairing}
                    onFontChange={onFontThemeChange}
                    language={language}
                  />
                </div>
                
                <div className="bg-white/60 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-100/60 dark:border-slate-700/40 backdrop-blur-sm shadow-sm">
                  <label className="flex items-center gap-3 text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                    Primary Color
                  </label>
                  <ColorPicker
                    colors={COLOR_PALETTE.primary}
                    selectedColor={config.styles.colorPrimary}
                    onColorChange={(color) => onStyleChange('colorPrimary', color)}
                    showCustom={showCustomPrimary}
                    onToggleCustom={setShowCustomPrimary}
                    type="primary"
                  />
                </div>
                
                <div className="bg-white/60 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-100/60 dark:border-slate-700/40 backdrop-blur-sm shadow-sm">
                  <label className="flex items-center gap-3 text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                    Secondary Color
                  </label>
                  <ColorPicker
                    colors={COLOR_PALETTE.secondary}
                    selectedColor={config.styles.colorSecondary}
                    onColorChange={(color) => onStyleChange('colorSecondary', color)}
                    showCustom={showCustomSecondary}
                    onToggleCustom={setShowCustomSecondary}
                    type="secondary"
                  />
                </div>
                
                <div className="bg-white/60 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-100/60 dark:border-slate-700/40 backdrop-blur-sm shadow-sm">
                  <label className="flex items-center gap-3 text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"></div>
                    Background Color
                  </label>
                  <ColorPicker
                    colors={COLOR_PALETTE.background}
                    selectedColor={config.styles.colorBackground}
                    onColorChange={(color) => onStyleChange('colorBackground', color)}
                    showCustom={showCustomBackground}
                    onToggleCustom={setShowCustomBackground}
                    type="background"
                  />
                </div>
              </div>
            </AccordionItem>
          </div>
        </div>
      </div>
      
      {/* Enhanced Resize Handle - More visible and accessible */}
      {!isCollapsed && (
        <div
          className={`absolute top-0 right-0 w-4 h-full cursor-col-resize transition-all duration-300 group ${
            isDragging 
              ? 'bg-gradient-to-r from-blue-200/80 to-indigo-200/60 dark:from-blue-800/60 dark:to-indigo-800/50' 
              : 'bg-slate-100/30 dark:bg-slate-700/30 hover:bg-gradient-to-r hover:from-blue-100/60 hover:to-indigo-100/40 dark:hover:from-blue-900/40 dark:hover:to-indigo-900/30'
          }`}
          onMouseDown={handleMouseDown}
          title="Drag to resize panel"
        >
          {/* Multiple grip indicators for better visibility */}
          <div className="absolute top-1/2 right-1 transform -translate-y-1/2 flex flex-col gap-1">
            <div className={`w-0.5 h-4 rounded-full transition-all duration-300 ${
              isDragging 
                ? 'bg-blue-500 dark:bg-blue-400 shadow-md shadow-blue-500/40' 
                : 'bg-slate-400/60 dark:bg-slate-500/60 group-hover:bg-blue-400 dark:group-hover:bg-blue-400'
            }`} />
            <div className={`w-0.5 h-4 rounded-full transition-all duration-300 ${
              isDragging 
                ? 'bg-blue-500 dark:bg-blue-400 shadow-md shadow-blue-500/40' 
                : 'bg-slate-400/60 dark:bg-slate-500/60 group-hover:bg-blue-400 dark:group-hover:bg-blue-400'
            }`} />
          </div>
          
          {/* Larger invisible hit area */}
          <div className="absolute inset-0 w-6 right-0" />
        </div>
      )}
      
      {/* Custom Styles */}
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgb(148 163 184 / 0.5) transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgb(148 163 184 / 0.3), rgb(100 116 139 / 0.5));
          border-radius: 9999px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgb(59 130 246 / 0.5), rgb(99 102 241 / 0.7));
        }
      `}</style>
    </aside>
  );
};

export default EditorPanel;

