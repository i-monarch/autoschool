'use client'

import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="form-control w-full">
        <label className="label" htmlFor={inputId}>
          <span className="label-text font-medium">{label}</span>
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`input input-bordered w-full h-12 text-base ${
            error ? 'input-error' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <label className="label">
            <span className="label-text-alt text-error">{error}</span>
          </label>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export default Input
