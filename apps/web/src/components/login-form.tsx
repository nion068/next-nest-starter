'use client';

import { ApiClient } from '@starter/api-client';
import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';

const client = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
});

type LoginLabels = {
  email: string;
  password: string;
  submit: string;
  emailLogin: string;
  phoneLogin: string;
  phone: string;
  verificationCode: string;
  sendCode: string;
  verifyAndSignIn: string;
  codeSent: string;
  signedIn: string;
};

export function LoginForm({ labels }: { labels: LoginLabels }) {
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeRequested, setCodeRequested] = useState(false);

  const emailLogin = useMutation({ mutationFn: () => client.login({ email, password }) });
  const requestPhoneCode = useMutation({
    mutationFn: () => client.requestPhoneCode(phone),
    onSuccess: () => setCodeRequested(true),
  });
  const phoneLogin = useMutation({ mutationFn: () => client.loginPhone({ phone, code }) });

  const error = emailLogin.error ?? requestPhoneCode.error ?? phoneLogin.error;
  const isPending = emailLogin.isPending || requestPhoneCode.isPending || phoneLogin.isPending;

  function switchMode(nextMode: 'email' | 'phone') {
    setMode(nextMode);
    setCodeRequested(false);
    setCode('');
  }

  function submitPhoneLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (codeRequested) {
      phoneLogin.mutate();
      return;
    }
    requestPhoneCode.mutate();
  }

  return (
    <>
      <div aria-label="Login method" className="login-tabs" role="tablist">
        <button
          aria-selected={mode === 'email'}
          className={mode === 'email' ? 'active' : ''}
          onClick={() => switchMode('email')}
          role="tab"
          type="button"
        >
          {labels.emailLogin}
        </button>
        <button
          aria-selected={mode === 'phone'}
          className={mode === 'phone' ? 'active' : ''}
          onClick={() => switchMode('phone')}
          role="tab"
          type="button"
        >
          {labels.phoneLogin}
        </button>
      </div>

      {mode === 'email' ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            emailLogin.mutate();
          }}
        >
          <label>
            {labels.email}
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            {labels.password}
            <input
              required
              minLength={8}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button disabled={isPending} type="submit">
            {labels.submit}
          </button>
        </form>
      ) : (
        <form onSubmit={submitPhoneLogin}>
          <label>
            {labels.phone}
            <input
              required
              autoComplete="tel"
              pattern="\+[1-9]\d{7,14}"
              placeholder="+8801XXXXXXXXX"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>
          {codeRequested && (
            <label>
              {labels.verificationCode}
              <input
                required
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                pattern="\d{6}"
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </label>
          )}
          <button disabled={isPending} type="submit">
            {codeRequested ? labels.verifyAndSignIn : labels.sendCode}
          </button>
          {codeRequested && !phoneLogin.isSuccess && <p role="status">{labels.codeSent}</p>}
        </form>
      )}

      {(emailLogin.isSuccess || phoneLogin.isSuccess) && <p role="status">{labels.signedIn}</p>}
      {error && <p role="alert">{error.message}</p>}
    </>
  );
}
