'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';

type CurrentUser = {
  username: string;
  displayName: string;
};

/**
 * `username` is the Cognito sub (UUID) — stable, used for ownership checks
 * and unique IDs. `displayName` is derived from the user's email prefix and
 * is what we show in UI (avatar initial, activity feed, BoyCard owner).
 */
export function useCurrentUser(): CurrentUser | null {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { username } = await getCurrentUser();
      const attrs = await fetchUserAttributes();
      const email = attrs.email ?? '';
      const displayName = email.split('@')[0] || username;
      if (!cancelled) setUser({ username, displayName });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return user;
}
