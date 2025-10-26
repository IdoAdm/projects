import React from 'react';

interface SelectFieldProps {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  error?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  id,
  name,
  value,
  onChange,
  options,
  required = false,
  error,
}) => {
  const baseClasses = "block w-full pl-3 pr-10 py-3 text-base border-zinc-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg transition duration-150 ease-in-out";
  const errorClasses = "border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500";
  const normalClasses = "border-zinc-300 focus:ring-primary focus:border-primary";

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-zinc-700 mb-2">
        {label} {required && <span className="text-red-500"></span>}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`${baseClasses} ${error ? errorClasses : normalClasses}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        {options.map((option, idx) => (
          idx === 0 ? (
            <option key={option.value} value={option.value} disabled style={{ color: '#a1a1aa' }}>
              {option.label}
            </option>
          ) : (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          )
        ))}
      </select>
      {error && <p id={`${id}-error`} className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default SelectField;