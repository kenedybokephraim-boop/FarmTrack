"use client"

import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variants = {
  primary: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-500/20',
  secondary: 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 border border-slate-600/30',
  danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white',
  ghost: 'hover:bg-slate-800/50 text-slate-300',
  outline: 'bg-transparent border border-slate-600/50 hover:border-slate-500 hover:bg-slate-800/30 text-slate-300'
}

const sizes = {
  sm: 'px-3 py-2 text-sm rounded-lg',
  md: 'px-4 py-3 text-base rounded-xl',
  lg: 'px-6 py-4 text-lg rounded-xl'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          font-semibold transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          active:scale-[0.98]
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12s5.373 12 12 12 8-8 8-8V0z" />
            </svg>
            Processing...
          </span>
        ) : children}
      </button>
    )
  }
)

Button.displayName = 'Button'