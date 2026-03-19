'use client'

import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  rightIcon?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, rightIcon, id, className = '', ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="form-control w-full">
        <label className="label" htmlFor={inputId}>
          <span className="label-text font-medium">{label}</span>
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={`input input-bordered w-full h-12 text-base ${
              rightIcon ? 'pr-12' : ''
            } ${error ? 'input-error' : ''} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <label className="label pb-0">
            <span className="label-text-alt text-error">{error}</span>
          </label>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export default Input
