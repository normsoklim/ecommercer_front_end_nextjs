import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'km'],
  defaultLocale: 'en',
  localePrefix: 'always',
  localeCookie: {
    maxAge: 60 * 60 * 24 * 365
  }
});

export const {
  Link,
  redirect,
  usePathname,
  useRouter,
  getPathname
} = createNavigation(routing);
