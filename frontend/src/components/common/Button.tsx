import React from 'react';

export type ButtonVariant = 'primary' | 'neon' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  className = '',
  disabled,
  ...rest
}) => {
  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-[#3b82f6] hover:bg-[#2563eb] text-white shadow-md shadow-blue-500/20 active:translate-y-[1px] border border-blue-400/30',
    neon:
      'bg-[#06ffa5] hover:bg-[#00e693] text-[#0a0e17] font-bold shadow-[0_0_15px_rgba(6,255,165,0.4)] hover:shadow-[0_0_22px_rgba(6,255,165,0.6)] active:translate-y-[1px] border border-[#06ffa5]',
    secondary:
      'bg-[#1e293b] hover:bg-[#334155] text-[#e2e8f0] border border-[#334155]/60 hover:text-white',
    danger:
      'bg-[#ef4444]/20 hover:bg-[#ef4444]/30 text-[#ef4444] border border-[#ef4444]/40 hover:text-white',
    ghost:
      'bg-transparent hover:bg-[#1e293b]/60 text-[#94a3b8] hover:text-[#e2e8f0] border border-transparent',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs px-3 py-1.5 rounded-md gap-1.5 font-medium',
    md: 'text-sm px-4 py-2 rounded-lg gap-2 font-medium',
    lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5 font-semibold',
  };

  return (
    <button
      className={`inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon && <span className="flex items-center">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
