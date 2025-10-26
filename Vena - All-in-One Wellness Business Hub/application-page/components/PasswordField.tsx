import React, { useState, useMemo } from 'react';

interface PasswordFieldProps {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  id,
  name,
  value,
  onChange,
  required = false,
  error,
}) => {
  const [show, setShow] = useState(false);

  const strength = useMemo(() => {
    if (!value) return 0;
    let score = 0;
    if (value.length >= 8) score++;
    if (value.length >= 12) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[a-z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    // normalize to 0-4
    return Math.min(4, Math.floor((score / 6) * 4));
  }, [value]);

  const strengthLabels = ['Very weak', 'Weak', 'Good', 'Strong', 'Very strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-600'];
  const baseClasses = "appearance-none block w-full px-4 py-3 border rounded-lg placeholder-zinc-400 focus:outline-none sm:text-sm transition duration-150 ease-in-out";
  const errorClasses = "border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500";
  const normalClasses = "border-zinc-300 focus:ring-primary focus:border-primary";

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-zinc-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`${baseClasses} ${error ? errorClasses : normalClasses} pr-20`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute inset-y-0 right-0 px-3 text-sm font-medium text-primary hover:text-primary-dark focus:outline-none"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      {/* Strength meter */}
      {value && (
        <div className="mt-2" aria-live="polite">
          <div className="flex gap-1 mb-1" role="meter" aria-valuemin={0} aria-valuemax={4} aria-valuenow={strength} aria-label="Password strength">
            {[0,1,2,3].map(i => (
              <div key={i} className={`h-1 flex-1 rounded ${i <= strength - 1 ? strengthColors[strength] : 'bg-zinc-200'}`}></div>
            ))}
          </div>
          <p className={`text-xs font-medium ${['text-red-600','text-orange-600','text-yellow-600','text-green-600','text-emerald-600'][strength]}`}>{strengthLabels[strength]}</p>
        </div>
      )}
      {error && <p id={`${id}-error`} className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default PasswordField;
