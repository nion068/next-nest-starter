export const locales = ['en', 'bn'] as const;
export type Locale = (typeof locales)[number];
export const messages = {
  en: {
    title: 'Starter Platform',
    subtitle: 'A reusable Next.js and NestJS foundation',
    signIn: 'Sign in',
    email: 'Email address',
    password: 'Password',
    submit: 'Continue',
    register: 'Create account',
    language: 'বাংলা',
  },
  bn: {
    title: 'স্টার্টার প্ল্যাটফর্ম',
    subtitle: 'পুনঃব্যবহারযোগ্য নেক্সট.জেএস ও নেস্ট.জেএস ভিত্তি',
    signIn: 'সাইন ইন',
    email: 'ইমেইল ঠিকানা',
    password: 'পাসওয়ার্ড',
    submit: 'চালিয়ে যান',
    register: 'অ্যাকাউন্ট তৈরি করুন',
    language: 'English',
  },
} as const;
