import { LoginPageClient } from './LoginPageClient';

type LoginSearchParams = {
  next?: string | string[];
};

function getNextPath(nextParam?: string) {
  if (typeof nextParam !== 'string') return '/locations';
  if (!nextParam.startsWith('/')) return '/locations';
  if (nextParam.startsWith('/login')) return '/locations';
  return nextParam;
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<LoginSearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const nextParam = Array.isArray(resolvedSearchParams.next)
    ? resolvedSearchParams.next[0]
    : resolvedSearchParams.next;
  const nextPath = getNextPath(nextParam);

  return <LoginPageClient nextPath={nextPath} />;
}
