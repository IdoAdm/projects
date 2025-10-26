import React, { useState, useMemo } from "react";
import type { FormData as RegistrationFormData } from "../types";
import { BUSINESS_NICHES } from "../constants";
import { supabase } from "../lib/supabaseClient";

interface RegistrationFormProps {
  onSuccess: (details: { email: string }) => void;
}

const initialFormData: RegistrationFormData = {
  businessName: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  socialMedia: '',
  businessNiche: '',
  logo: null
};

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<RegistrationFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationFormData, string>> & { submit?: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear any existing error for this field
    if (errors[name as keyof RegistrationFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle file changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, logo: file }));
    // Clear any existing error for this field
    if (errors.logo) {
      setErrors(prev => ({ ...prev, logo: undefined }));
    }
  };

  // Simple strength scoring: length + character variety
  const passwordStrength = useMemo(() => {
    const pwd = formData.password || '';
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return Math.min(score, 5);
  }, [formData.password]);

  const strengthLabel = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Excellent"][passwordStrength];
  // ✅ Prevent native navigation; call App.tsx handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Step 1: Sign up the user with Supabase Auth
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            business_name: formData.businessName,
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error("Sign up successful, but no user returned.");

      // Step 2: Insert public profile data into the 'registrations' table
      const { error: insertError } = await supabase
        .from('registrations')
        .insert({
          id: user.id,
          email: user.email,
          business_name: formData.businessName,
          first_name: formData.firstName,
          last_name: formData.lastName,
          // Add any other fields you collect
        });

      if (insertError) throw insertError;

      // Step 3: Call the onSuccess callback to trigger the redirect
      onSuccess({ email: formData.email });

    } catch (err: any) {
      console.error('Registration failed:', err);
      setErrors({ submit: err.message || 'An unknown error occurred.' });
      setLoading(false);
    }
    // No need to set loading to false on success, as the page will redirect
  };

  // Enforce required fields + password policy before allowing submit
  const MIN_PWD = 8;
  const passwordsMatch = !!formData.password && formData.password === formData.confirmPassword;
  const passwordLongEnough = formData.password.trim().length >= MIN_PWD;
  const allRequiredFilled = (
    formData.businessName.trim() !== '' &&
    formData.firstName.trim() !== '' &&
    formData.lastName.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.password.trim() !== '' &&
    formData.confirmPassword.trim() !== '' &&
    formData.businessNiche.trim() !== ''
  );
  const canSubmit = allRequiredFilled && passwordsMatch && passwordLongEnough;

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-3">
      {/* Business name */}
      <label className="grid gap-1">
        <span className="text-sm text-zinc-700">Business name *</span>
        <input
          className="border rounded px-3 py-2"
          name="businessName"
          value={formData.businessName}
          onChange={handleInputChange}
          placeholder="Acme Wellness"
          required
        />
        {errors.businessName && <p className="text-red-600 text-sm">{errors.businessName}</p>}
      </label>

      {/* First / Last (required) */}
      <div className="grid md:grid-cols-2 gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-zinc-700">First name *</span>
          <input
            className="border rounded px-3 py-2"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="First name"
            required
          />
          {errors.firstName && <p className="text-red-600 text-sm">{errors.firstName}</p>}
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-zinc-700">Last name *</span>
          <input
            className="border rounded px-3 py-2"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Last name"
            required
          />
          {errors.lastName && <p className="text-red-600 text-sm">{errors.lastName}</p>}
        </label>
      </div>

      {/* Email */}
      <label className="grid gap-1">
        <span className="text-sm text-zinc-700">Email *</span>
        <input
          className="border rounded px-3 py-2"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="you@example.com"
          required
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
      </label>

      {/* Password (required) with show/hide & strength */}
      <div className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-zinc-700 flex items-center justify-between">
            <span>Password *</span>
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-indigo-600 hover:text-indigo-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M3 3l18 18" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.58 10.58a2 2 0 002.84 2.84" />
                  <path d="M9.88 5.51A9.64 9.64 0 0112 5c7 0 10 7 10 7a13.2 13.2 0 01-1.67 2.68m-2.71 2.3A9.86 9.86 0 0112 19c-7 0-10-7-10-7a18.7 18.7 0 013.95-4.94" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </span>
          <input
            className="border rounded px-3 py-2"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="********"
            required
            aria-describedby="password-strength"
          />
          {/* Strength meter */}
          {formData.password && formData.password.length > 0 && (
            <div className="mt-2" id="password-strength">
              <div className="flex gap-1 mb-1" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => {
                  const filled = i < passwordStrength;
                  // color palette from weak->strong
                  const colors = [
                    'bg-red-500',        // very weak
                    'bg-orange-500',     // weak
                    'bg-yellow-500',     // fair
                    'bg-lime-500',       // good
                    'bg-green-500'       // strong/excellent
                  ];
                  const barColor = filled ? colors[Math.min(passwordStrength - 1, colors.length - 1)] : 'bg-zinc-300';
                  return (
                    <span
                      key={i}
                      className={`h-2 flex-1 rounded-md transition-colors duration-300 ${barColor}`}
                    />
                  );
                })}
              </div>
              <p className={`text-xs font-medium ${
                passwordStrength <= 1 ? 'text-red-600' :
                passwordStrength === 2 ? 'text-yellow-600' :
                passwordStrength === 3 ? 'text-lime-600' :
                'text-green-600'
              }`}>Strength: {strengthLabel}</p>
            </div>
          )}
          {formData.password && formData.password.length > 0 && formData.password.length < 8 && (
            <p className="text-xs text-amber-600 mt-1">Minimum 8 characters required.</p>
          )}
          {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-zinc-700 flex items-center justify-between">
            <span>Confirm password *</span>
            <button
              type="button"
              onClick={() => setShowConfirm(c => !c)}
              className="p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-indigo-600 hover:text-indigo-700"
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirm ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M3 3l18 18" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.58 10.58a2 2 0 002.84 2.84" />
                  <path d="M9.88 5.51A9.64 9.64 0 0112 5c7 0 10 7 10 7a13.2 13.2 0 01-1.67 2.68m-2.71 2.3A9.86 9.86 0 0112 19c-7 0-10-7-10-7a18.7 18.7 0 013.95-4.94" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </span>
          <input
            className="border rounded px-3 py-2"
            type={showConfirm ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="********"
            required
          />
          {formData.confirmPassword && formData.password && formData.confirmPassword !== formData.password && (
            <p className="text-xs text-red-600 mt-1">Passwords do not match.</p>
          )}
          {errors.confirmPassword && <p className="text-red-600 text-sm">{errors.confirmPassword}</p>}
        </label>
      </div>

      {/* Social + Niche */}
      <label className="grid gap-1">
        <span className="text-sm text-zinc-700">Social media (optional)</span>
        <input
          className="border rounded px-3 py-2"
          name="socialMedia"
          value={formData.socialMedia}
          onChange={handleInputChange}
          placeholder="https://instagram.com/yourbusiness"
        />
        {errors.socialMedia && <p className="text-red-600 text-sm">{errors.socialMedia}</p>}
      </label>

      <label className="grid gap-1">
        <span className="text-sm text-zinc-700">Business niche *</span>
        <select
          className="border rounded px-3 py-2 bg-white"
          name="businessNiche"
          value={formData.businessNiche}
          onChange={handleInputChange}
          required
        >
          {BUSINESS_NICHES.map(opt => (
            <option key={opt.value || 'placeholder'} value={opt.value} disabled={opt.value === ''}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.businessNiche && <p className="text-red-600 text-sm">{errors.businessNiche}</p>}
      </label>

      {/* Logo (optional) */}
      <label className="grid gap-1">
        <span className="text-sm text-zinc-700">Logo (optional)</span>
        <input className="border rounded px-3 py-2" type="file" accept="image/*" onChange={handleFileChange} />
        {errors.logo && <p className="text-red-600 text-sm">{errors.logo}</p>}
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit || loading}
        className="mt-2 rounded px-4 py-2 font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed focus: outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 transition-colors bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary"
        aria-disabled={!canSubmit || loading}
      >
        {loading ? 'Registering...' : (canSubmit ? 'Register' : 'Complete required fields')}
      </button>

      {errors.submit && (
        <p className="mt-2 text-red-600 text-sm">{errors.submit}</p>
      )}
    </form>
  );
}

export default RegistrationForm;
