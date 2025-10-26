import React from 'react';

interface InputFieldProps {
  label: string;
  id: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
}) => {
  const baseClasses = "appearance-none block w-full px-4 py-3 border rounded-lg placeholder-zinc-400 focus:outline-none sm:text-sm transition duration-150 ease-in-out";
  const errorClasses = "border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500";
  const normalClasses = "border-zinc-300 focus:ring-primary focus:border-primary";

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-zinc-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`${baseClasses} ${error ? errorClasses : normalClasses}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && <p id={`${id}-error`} className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default InputField;