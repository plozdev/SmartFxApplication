import React from 'react';

export type BadgeVariant = 'profit' | 'loss' | 'action' | 'neon' | 'neutral' | 'warning';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
  glow?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  dot = false,
  glow = false,
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    profit: 'bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30',
    loss: 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30',
    action: 'bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/30',
    neon: 'bg-[#06ffa5]/15 text-[#06ffa5] border-[#06ffa5]/40',
    warning: 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30',
    neutral: 'bg-[#1e293b]/70 text-[#94a3b8] border-[#334155]/40',
  };

  const sizeStyles: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  };

  const dotColor: Record<BadgeVariant, string> = {
    profit: 'bg-[#22c55e]',
    loss: 'bg-[#ef4444]',
    action: 'bg-[#3b82f6]',
    neon: 'bg-[#06ffa5]',
    warning: 'bg-[#f59e0b]',
    neutral: 'bg-[#94a3b8]',
  };

  const glowStyle = glow && variant === 'neon' ? 'shadow-[0_0_12px_rgba(6,255,165,0.35)]' : '';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-mono tracking-tight transition-all duration-200 ${variantStyles[variant]} ${sizeStyles[size]} ${glowStyle} ${className}`}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${dotColor[variant]}`} />
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dotColor[variant]}`} />
        </span>
      )}
      {children}
    </span>
  );
};
