export function scoreDetailHref(slug: string, guestToken?: string | null): string {
  return guestToken
    ? `/scores/${slug}?token=${encodeURIComponent(guestToken)}`
    : `/scores/${slug}`;
}

export function scoreEditHref(slug: string, guestToken?: string | null): string {
  return guestToken
    ? `/scores/${slug}/edit?token=${encodeURIComponent(guestToken)}`
    : `/scores/${slug}/edit`;
}
