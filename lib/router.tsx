'use client';

import NextLink from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { usePathname, useRouter, useParams as useNextParams, useSearchParams as useNextSearchParams } from 'next/navigation';

type AppLinkProps = Omit<ComponentProps<typeof NextLink>, 'href'> & {
  to?: ComponentProps<typeof NextLink>['href'];
  href?: ComponentProps<typeof NextLink>['href'];
  children?: ReactNode;
};

export function Link({ to, href, ...rest }: AppLinkProps) {
  return <NextLink href={href ?? to ?? '/'} {...rest} />;
}

export function useNavigate() {
  const router = useRouter();
  return (to: string | number, options?: { replace?: boolean }) => {
    if (typeof to === 'number') {
      if (to < 0) router.back();
      else router.forward();
      return;
    }
    if (options?.replace) router.replace(to);
    else router.push(to);
  };
}

export function useLocation() {
  const pathname = usePathname() || '/';
  const searchParams = useNextSearchParams();
  const search = searchParams?.toString() ? `?${searchParams.toString()}` : '';
  return { pathname, search, hash: '', state: null, key: pathname };
}

export function useParams() {
  return useNextParams() || {};
}

export function useSearchParams() {
  const searchParams = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const setSearchParams = (next, _options?: { replace?: boolean }) => {
    const params = next instanceof URLSearchParams ? next : new URLSearchParams(next);
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    if (_options?.replace) router.replace(url);
    else router.push(url);
  };
  return [searchParams, setSearchParams] as const;
}

export function Navigate({ to, replace }) {
  const router = useRouter();
  if (typeof window !== 'undefined') {
    if (replace) router.replace(to);
    else router.push(to);
  }
  return null;
}
