export type ApiClientOptions = { baseUrl: string; fetch?: typeof globalThis.fetch };
export class ApiClient {
  private fetcher: typeof globalThis.fetch;
  constructor(private readonly options: ApiClientOptions) { this.fetcher = (options.fetch ?? globalThis.fetch).bind(globalThis); }
  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await this.fetcher(`${this.options.baseUrl}/api/v1${path}`, { ...init, credentials: 'include', headers: { 'content-type': 'application/json', ...init.headers } });
    if (!response.ok) throw new Error((await response.json().catch(() => ({ message: response.statusText }))).message);
    return response.status === 204 ? undefined as T : response.json() as Promise<T>;
  }
  register(input: { email: string; password: string; phone?: string }) { return this.request<{ id: string; email: string }>('/auth/register', { method: 'POST', body: JSON.stringify(input) }); }
  login(input: { email: string; password: string }) { return this.request<{ ok: true }>('/auth/login', { method: 'POST', body: JSON.stringify(input) }); }
  logout() { return this.request<void>('/auth/logout', { method: 'POST' }); }
  refresh() { return this.request<{ ok: true }>('/auth/refresh', { method: 'POST' }); }
  requestPhoneCode(phone: string) { return this.request<void>('/auth/phone/code', { method: 'POST', body: JSON.stringify({ phone }) }); }
  loginPhone(input: { phone: string; code: string }) { return this.request<{ ok: true }>('/auth/phone/login', { method: 'POST', body: JSON.stringify(input) }); }
}
