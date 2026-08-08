import { describe, expect, it } from 'vitest';
import { locales, messages } from './i18n';
describe('locales', () => { it('ships a message catalog for every locale', () => { locales.forEach((locale) => expect(messages[locale].title).toBeTruthy()); }); });
