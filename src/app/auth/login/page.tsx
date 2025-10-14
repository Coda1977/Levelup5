'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const { supabase } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [redirectTo, setRedirectTo] = useState('/learn');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [touched, setTouched] = useState({ email: false, password: false });

  useEffect(() => {
    // Get the redirect parameter from URL
    const redirect = searchParams.get('redirect');
    if (redirect && redirect.startsWith('/')) {
      setRedirectTo(redirect);
    }
  }, [searchParams]);

  const validateEmail = (value: string): string => {
    if (!value.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (value: string): string => {
    if (!value) {
      return 'Password is required';
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const handleEmailBlur = () => {
    setTouched({ ...touched, email: true });
    setEmailError(validateEmail(email));
  };

  const handlePasswordBlur = () => {
    setTouched({ ...touched, password: true });
    setPasswordError(validatePassword(password));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (touched.email) {
      setEmailError(validateEmail(value));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      setPasswordError(validatePassword(value));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Mark all fields as touched
    setTouched({ email: true, password: true });

    // Validate all fields
    const emailValidationError = validateEmail(email);
    const passwordValidationError = validatePassword(password);

    setEmailError(emailValidationError);
    setPasswordError(passwordValidationError);

    // If there are validation errors, don't submit
    if (emailValidationError || passwordValidationError) {
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      router.push(redirectTo);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Login to LevelUp</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              aria-invalid={emailError ? 'true' : 'false'}
              aria-describedby={emailError ? 'email-error' : undefined}
              className={`block w-full px-3 py-2 mt-1 placeholder-gray-400 border rounded-md shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm ${
                emailError
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-accent-blue focus:border-accent-blue'
              }`}
            />
            {emailError && (
              <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                {emailError}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              aria-invalid={passwordError ? 'true' : 'false'}
              aria-describedby={passwordError ? 'password-error' : undefined}
              className={`block w-full px-3 py-2 mt-1 placeholder-gray-400 border rounded-md shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm ${
                passwordError
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-accent-blue focus:border-accent-blue'
              }`}
            />
            {passwordError && (
              <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                {passwordError}
              </p>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-accent-blue border border-transparent rounded-md shadow-sm hover:bg-accent-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
            >
              Sign in
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <a href="/auth/signup" className="font-medium text-accent-blue hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}