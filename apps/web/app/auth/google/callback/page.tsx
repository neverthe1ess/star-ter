import { normalizeNextPath } from '@/lib/auth/auth-flow';
import { GoogleCallbackClient } from './GoogleCallbackClient';

type CallbackSearchParams = {
  next?: string | string[];
};

export default function GoogleCallbackPage({
  searchParams,
}: {
  searchParams?: CallbackSearchParams;
}) {
  const nextParam = Array.isArray(searchParams?.next)
    ? searchParams?.next[0]
    : searchParams?.next;
  const nextPath = normalizeNextPath(nextParam);

  return <GoogleCallbackClient nextPath={nextPath} />;
}
