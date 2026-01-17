import { LoginPageClient } from './LoginPageClient';
import { normalizeNextPath } from '@/lib/auth/auth-flow';

type LoginSearchParams = {
  next?: string | string[];
};

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<LoginSearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const nextParam = Array.isArray(resolvedSearchParams.next)
    ? resolvedSearchParams.next[0]
    : resolvedSearchParams.next;
  const nextPath = normalizeNextPath(nextParam);

  return <LoginPageClient nextPath={nextPath} />;
}
