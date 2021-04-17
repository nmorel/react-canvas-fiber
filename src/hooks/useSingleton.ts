import { useRef } from "react";

export function useSingleton<T>(init: () => T): T {
  const singletonRef = useRef<T>();
  if (!singletonRef.current) {
    singletonRef.current = init();
  }
  // @ts-ignore
  return singletonRef.current;
}
