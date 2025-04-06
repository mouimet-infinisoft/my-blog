'use client';

import { SocialMediaTargets } from '@/lib/types';

interface SocialMediaSelectorProps {
  value: SocialMediaTargets;
  onChange: (value: SocialMediaTargets) => void;
}

export function SocialMediaSelector({ value, onChange }: SocialMediaSelectorProps) {
  const handleChange = (platform: keyof SocialMediaTargets) => {
    const newValue = {
      ...value,
      [platform]: !value[platform],
    };
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <SocialMediaCheckbox
          id="linkedin"
          label="LinkedIn"
          checked={!!value.linkedin}
          onChange={() => handleChange('linkedin')}
          icon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          }
        />
        <SocialMediaCheckbox
          id="twitter"
          label="Twitter"
          checked={!!value.twitter}
          onChange={() => handleChange('twitter')}
          icon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          }
        />
        <SocialMediaCheckbox
          id="facebook"
          label="Facebook"
          checked={!!value.facebook}
          onChange={() => handleChange('facebook')}
          icon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
            </svg>
          }
        />
        <SocialMediaCheckbox
          id="devto"
          label="DEV.to"
          checked={!!value.devto}
          onChange={() => handleChange('devto')}
          icon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6l.02 2.44.04 2.45.56-.02c.41 0 .63-.07.83-.26.24-.24.26-.36.26-2.2 0-1.91-.02-1.96-.29-2.18zM0 4.94v14.12h24V4.94H0zM8.56 15.3c-.44.58-1.06.77-2.53.77H4.71V8.53h1.4c1.67 0 2.16.18 2.6.9.27.43.29.6.32 2.57.05 2.23-.02 2.73-.47 3.3zm5.09-5.47h-2.47v1.77h1.52v1.28l-.72.04-.75.03v1.77l1.22.03 1.2.04v1.28h-1.6c-1.53 0-1.6-.01-1.87-.3l-.3-.28v-3.16c0-3.02.01-3.18.25-3.48.23-.31.25-.31 1.88-.31h1.64v1.3zm4.68 5.45c-.17.43-.64.79-1 .79-.18 0-.45-.15-.67-.39-.32-.32-.45-.63-.82-2.08l-.9-3.39-.45-1.67h.76c.4 0 .75.02.75.05 0 .06 1.16 4.54 1.26 4.83.04.15.32-.7.73-2.3l.66-2.52.74-.04c.4-.02.73 0 .73.04 0 .14-1.67 6.38-1.8 6.68z" />
            </svg>
          }
        />
      </div>
    </div>
  );
}

interface SocialMediaCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  icon: React.ReactNode;
}

function SocialMediaCheckbox({ id, label, checked, onChange, icon }: SocialMediaCheckboxProps) {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500 dark:border-zinc-600 dark:bg-zinc-700"
      />
      <label
        htmlFor={id}
        className="ml-2 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        <span className="text-zinc-500 dark:text-zinc-400">{icon}</span>
        {label}
      </label>
    </div>
  );
}
