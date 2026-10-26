import { OpenSreBrandLogo } from '@/components/brand/OpenSreBrandLogo';

/** Admin sidebar wordmark — asset includes text; no duplicate label beside it. */
export const LogoFull = () => (
  <div className="relative flex h-full w-full items-center">
    <OpenSreBrandLogo variant="wordmark" surface="topbar" />
  </div>
);
