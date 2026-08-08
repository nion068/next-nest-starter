'use client';
import { useMutation } from '@tanstack/react-query';
import { ApiClient } from '@starter/api-client';
import { useState } from 'react';
const client = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
});
export function LoginForm({
  labels,
}: {
  labels: { email: string; password: string; submit: string };
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const mutation = useMutation({ mutationFn: () => client.login({ email, password }) });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <label>
        {labels.email}
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        {labels.password}
        <input
          required
          minLength={8}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button disabled={mutation.isPending} type="submit">
        {labels.submit}
      </button>
      {mutation.isSuccess && <p role="status">Signed in.</p>}
      {mutation.isError && <p role="alert">{mutation.error.message}</p>}
    </form>
  );
}
