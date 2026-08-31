import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  neonBorder?: boolean;
  header?: React.ReactNode;
  headerRight?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = true,
  neonBorder = false,
  header,
  headerRight,
  ...rest
}) => {
  const baseCard = 'bg-[#111827] border border-[#1e293b] rounded-xl relative overflow-hidden transition-all duration-200';
  const hoverCard = hoverable ? 'hover:bg-[#1a2332] hover:border-[#334155]/60 hover:shadow-lg' : '';
  const neonCard = neonBorder ? 'border-[#06ffa5]/50 shadow-[0_0_20px_rgba(6,255,165,0.15)]' : '';

  return (
    <div className={`${baseCard} ${hoverCard} ${neonCard} ${className}`} {...rest}>
      {header && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e293b] bg-[#0d1322]/60">
          <div className="text-sm font-semibold text-[#e2e8f0] tracking-wide flex items-center gap-2">
            {header}
          </div>
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};
