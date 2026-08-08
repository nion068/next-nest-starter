import { describe, expect, it } from 'vitest';
import { AuthService } from './auth.service.js';
describe('AuthService', () => {
  it('pads one-time codes to six digits', () => {
    const service = Object.create(AuthService.prototype) as AuthService;
    expect((service as unknown as { code(): string }).code()).toMatch(/^\d{6}$/);
  });
});
