import { usePathname } from 'next/navigation'

export function useActivePath() {
  const pathname = usePathname()

  const checkActive = (url: string) => {
    if (!pathname) return false;
    const isBaseRoute = ['/protected/admin', '/protected/client', '/protected/employee', '/home', '/'].includes(url);
    if (isBaseRoute) {
      return pathname === url;
    }
    return pathname.startsWith(url);
  }

  return checkActive;
}