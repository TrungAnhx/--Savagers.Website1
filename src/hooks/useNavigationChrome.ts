import { useCallback, useEffect, useRef, useState } from 'react';

interface NavigationChromeState {
  isHidden: boolean;
  isScrolled: boolean;
}

const SCROLLED_THRESHOLD = 48;
const AUTO_HIDE_THRESHOLD = 220;
const REVEAL_THRESHOLD = 120;
const DIRECTION_THRESHOLD = 8;

export function useNavigationChrome(autoHide: boolean) {
  const [state, setState] = useState<NavigationChromeState>({
    isHidden: false,
    isScrolled: false,
  });
  const lastScrollYRef = useRef(0);
  const scrollFrameRef = useRef<number | null>(null);

  const reveal = useCallback(() => {
    setState((current) => current.isHidden ? { ...current, isHidden: false } : current);
  }, []);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const syncNavigation = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollYRef.current;

      setState((current) => {
        const isScrolled = currentScrollY > SCROLLED_THRESHOLD;
        let isHidden = current.isHidden;

        if (!autoHide || currentScrollY < REVEAL_THRESHOLD || scrollDelta < -DIRECTION_THRESHOLD) {
          isHidden = false;
        } else if (scrollDelta > DIRECTION_THRESHOLD && currentScrollY > AUTO_HIDE_THRESHOLD) {
          isHidden = true;
        }

        if (current.isHidden === isHidden && current.isScrolled === isScrolled) {
          return current;
        }

        return { isHidden, isScrolled };
      });

      lastScrollYRef.current = currentScrollY;
      scrollFrameRef.current = null;
    };

    const requestSync = () => {
      if (scrollFrameRef.current !== null) return;
      scrollFrameRef.current = window.requestAnimationFrame(syncNavigation);
    };

    requestSync();
    window.addEventListener('scroll', requestSync, { passive: true });

    return () => {
      window.removeEventListener('scroll', requestSync);
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
    };
  }, [autoHide]);

  return {
    isHidden: state.isHidden,
    isScrolled: state.isScrolled,
    reveal,
  };
}
