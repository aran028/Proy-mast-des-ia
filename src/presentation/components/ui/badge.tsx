import * as React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline'
}

export const Badge: React.FC<BadgeProps> = ({ 
  className = '', 
  variant = 'default', 
  ...props 
}) => {
  const variants = {
    default: 'bg-indigo-600/20 text-indigo-400',
    secondary: 'bg-zinc-800 text-zinc-400',
    outline: 'border border-zinc-700 text-zinc-400',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
