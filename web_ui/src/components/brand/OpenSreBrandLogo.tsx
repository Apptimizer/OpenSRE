import Image from 'next/image';
import { clsx } from 'clsx';

type Variant = 'wordmark' | 'spinner';
// avatar = chat bubble icon (investigation transcript)
type Surface = 'topbar' | 'login' | 'avatar';

// applift brand assets from the applift Design System; the dark wordmark only recolours the text.
const WORDMARK = { light: '/brand/applift-logo.svg', dark: '/brand/applift-logo-dark.svg', width: 131.571, height: 50 };
const MARK = { src: '/brand/applift-mark.svg', width: 50, height: 50 };

type Props = {
  variant: Variant;
  surface: Surface;
  priority?: boolean;
};

export function OpenSreBrandLogo({ variant, surface, priority }: Props) {
  if (variant === 'spinner') {
    return (
      <Image
        src={MARK.src}
        alt="applift"
        width={MARK.width}
        height={MARK.height}
        priority={priority}
        className={surface === 'avatar' ? 'h-5 w-5' : 'h-7 w-7'}
      />
    );
  }

  const size = surface === 'login' ? 'h-16 w-auto' : 'h-7 w-auto';
  return (
    <>
      <Image
        src={WORDMARK.light}
        alt="applift"
        width={WORDMARK.width}
        height={WORDMARK.height}
        priority={priority}
        className={clsx(size, 'dark:hidden')}
      />
      <Image
        src={WORDMARK.dark}
        alt="applift"
        width={WORDMARK.width}
        height={WORDMARK.height}
        priority={priority}
        className={clsx(size, 'hidden dark:block')}
      />
    </>
  );
}
