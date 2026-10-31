"use client"

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="text-xs text-slate-400 font-medium ml-1 mb-1.5 block">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full p-4 rounded-xl
            bg-slate-800/40 backdrop-blur-sm
            border border-slate-700/50
            text-white placeholder-slate-500
            transition-all duration-200
            focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-400 ml-1">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'