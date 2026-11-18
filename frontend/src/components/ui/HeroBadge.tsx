// Component: HeroBadge
// Source: 21st.dev (@Codehagen/hero-badge, Component ID: 1353)
// Retrieved via 21st.dev MCP / Registry
// Adapted for React 19 + TypeScript + Vite with midnight charcoal cosmic styling

import React from 'react';
import { motion, useAnimation, type Variants } from 'framer-motion';
import { cn } from '../../lib/utils';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export interface HeroBadgeProps {
  text: string;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const badgeVariants: Record<string, string> = {
  default: 'border-amber-800/40 text-amber-200 hover:bg-amber-950/20 hover:border-amber-700/60',
  outline: 'border-stone-700/60 text-stone-300 hover:border-stone-500 hover:text-white',
  ghost: 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-800/40',
};

const sizeVariants: Record<string, string> = {
  sm: 'px-2.5 py-1 text-xs gap-1.5',
  md: 'px-3.5 py-1.5 text-xs gap-2',
  lg: 'px-4.5 py-2 text-sm gap-2.5',
};

const iconAnimationVariants: Variants = {
  initial: { rotate: 0 },
  hover: { rotate: -12, scale: 1.1 },
};

export const HeroBadge: React.FC<HeroBadgeProps> = ({
  text,
  icon,
  endIcon,
  variant = 'default',
  size = 'md',
  className,
  onClick,
}) => {
  const controls = useAnimation();

  const baseClassName = cn(
    'inline-flex items-center rounded-full border transition-all duration-200 select-none backdrop-blur-md cursor-pointer',
    badgeVariants[variant],
    sizeVariants[size],
    className
  );

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="group focus:outline-none"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      onHoverStart={() => controls.start('hover')}
      onHoverEnd={() => controls.start('initial')}
      style={{
        background: 'rgba(16, 23, 19, 0.75)',
        border: '1px solid rgba(201, 168, 106, 0.3)',
      }}
    >
      <div className={baseClassName}>
        {icon && (
          <motion.div
            className="text-amber-400 transition-colors"
            variants={iconAnimationVariants}
            initial="initial"
            animate={controls}
            transition={{ type: 'spring', stiffness: 350, damping: 12 }}
          >
            {icon}
          </motion.div>
        )}
        <span style={{ fontWeight: 600, letterSpacing: '0.02em', color: '#C9A86A' }}>{text}</span>
        {endIcon && (
          <motion.div className="text-stone-400 group-hover:text-amber-300 transition-colors">
            {endIcon}
          </motion.div>
        )}
      </div>
    </motion.button>
  );
};
