// Component: TimelineTree (Composable Linear Milestone Feed)
// Source: 21st.dev (@nyxbui/timeline, Component ID: 1074)
// Retrieved via 21st.dev MCP / Registry
// Adapted for React 19 + TypeScript + Vite with midnight charcoal cosmic styling

import React from 'react';
import { cn } from '../../lib/utils';
import { Circle, Sparkles } from 'lucide-react';

interface TimelineProps extends React.HTMLAttributes<HTMLUListElement> {
  children: React.ReactNode;
}

export const Timeline = React.forwardRef<HTMLUListElement, TimelineProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <ul
        ref={ref}
        className={cn('relative flex flex-col gap-6 list-none p-0 m-0', className)}
        {...props}
      >
        {children}
      </ul>
    );
  }
);
Timeline.displayName = 'Timeline';

interface TimelineItemProps extends React.HTMLAttributes<HTMLLIElement> {
  status?: 'default' | 'current' | 'done';
}

export const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      className={cn('relative flex items-start gap-4 group cursor-pointer', className)}
      {...props}
    />
  )
);
TimelineItem.displayName = 'TimelineItem';

interface TimelineDotProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: 'default' | 'current' | 'done';
  color?: string;
  glowColor?: string;
}

export const TimelineDot = React.forwardRef<HTMLDivElement, TimelineDotProps>(
  ({ className, color = '#C9A86A', glowColor = 'rgba(201, 168, 106, 0.3)', status = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200',
        className
      )}
      style={{
        background: '#090D0B',
        borderColor: color,
        boxShadow: status === 'current' ? `0 0 12px ${glowColor}` : 'none',
      }}
      {...props}
    >
      {status === 'current' ? (
        <Sparkles className="size-3" style={{ color }} />
      ) : (
        <Circle className="size-2 fill-current" style={{ color }} />
      )}
    </div>
  )
);
TimelineDot.displayName = 'TimelineDot';

interface TimelineHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const TimelineHeading = React.forwardRef<HTMLHeadingElement, TimelineHeadingProps>(
  ({ className, children, ...props }, ref) => (
    <h4
      ref={ref}
      className={cn('text-sm font-semibold text-slate-100 tracking-tight leading-snug m-0', className)}
      {...props}
    >
      {children}
    </h4>
  )
);
TimelineHeading.displayName = 'TimelineHeading';

interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const TimelineContent = React.forwardRef<HTMLDivElement, TimelineContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex-1 text-xs text-slate-400 leading-relaxed', className)}
      {...props}
    >
      {children}
    </div>
  )
);
TimelineContent.displayName = 'TimelineContent';

interface TimelineLineProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: string;
}

export const TimelineLine = React.forwardRef<HTMLDivElement, TimelineLineProps>(
  ({ className, color = 'rgba(148, 163, 184, 0.15)', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('absolute left-3 top-6 bottom-0 w-px -translate-x-1/2', className)}
      style={{ background: color }}
      {...props}
    />
  )
);
TimelineLine.displayName = 'TimelineLine';
