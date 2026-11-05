'use client';

import {useTransition} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter} from '@/src/i18n/routing';
import {useSearchParams} from 'next/navigation';
import './language-switcher.css';

const languages = [
  {
    code: 'en',
    label: 'English',
    flag: '🇬🇧'
  },
  {
    code: 'km',
    label: 'ខ្មែរ',
    flag: '🇰🇭'
  }
] as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations('Language');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  function changeLanguage(nextLocale: 'en' | 'km') {
    if (nextLocale === locale || isPending) return;

    const queryString = searchParams.toString();

    const href = queryString
      ? `${pathname}?${queryString}`
      : pathname;

    startTransition(() => {
      router.replace(href, {
        locale: nextLocale
      });
    });
  }

  return (
    <div className="language-switcher">
      <label
        htmlFor="language-select"
        className="sr-only"
      >
        {t('label')}
      </label>

      <select
        id="language-select"
        value={locale}
        disabled={isPending}
        onChange={(event) =>
          changeLanguage(event.target.value as 'en' | 'km')
        }
        aria-label={t('label')}
      >
        {languages.map((language) => (
          <option
            key={language.code}
            value={language.code}
          >
            {language.flag} {language.label}
          </option>
        ))}
      </select>

      {isPending && (
        <span className="language-loading" aria-live="polite">
          Changing language...
        </span>
      )}
    </div>
  );
}
