import React from 'react';

interface BaseCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'elevated' | 'minimal';
  hoverable?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  onClick?: () => void;
}

const BaseCard: React.FC<BaseCardProps> = ({
  children,
  className = '',
  variant = 'default',
  hoverable = true,
  padding = 'lg',
  rounded = 'xl',
  onClick
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'glass':
        return 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/30';
      case 'elevated':
        return 'bg-white dark:bg-slate-800 shadow-xl border-0';
      case 'minimal':
        return 'bg-transparent border border-slate-200 dark:border-slate-700';
      default:
        return 'bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700';
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'sm':
        return 'p-4';
      case 'md':
        return 'p-6';
      case 'lg':
        return 'p-8';
      case 'xl':
        return 'p-10';
      default:
        return 'p-8';
    }
  };

  const getRoundedStyles = () => {
    switch (rounded) {
      case 'sm':
        return 'rounded-sm';
      case 'md':
        return 'rounded-md';
      case 'lg':
        return 'rounded-lg';
      case 'xl':
        return 'rounded-xl';
      case '2xl':
        return 'rounded-2xl';
      default:
        return 'rounded-xl';
    }
  };

  const getHoverStyles = () => {
    if (!hoverable) return 'transition-shadow duration-300';
    
    switch (variant) {
      case 'glass':
        return 'transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] hover:bg-white/90 dark:hover:bg-slate-800/90';
      case 'elevated':
        return 'transition-all duration-300 ease-out hover:shadow-3xl hover:-translate-y-3 hover:scale-[1.02]';
      case 'minimal':
        return 'transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-600';
      default:
        return 'transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02]';
    }
  };

  return (
    <div
      className={`
        ${getVariantStyles()}
        ${getPaddingStyles()}
        ${getRoundedStyles()}
        ${getHoverStyles()}
        ${onClick ? 'cursor-pointer select-none' : ''}
        transform-gpu
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default BaseCard;