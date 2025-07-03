'use client';
import { usePathname, useRouter } from 'next/navigation';

export default function ClientWrapper({ children }: { children: (props: { pathname: string, router: ReturnType<typeof useRouter> }) => React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  return children({ pathname, router });
} 