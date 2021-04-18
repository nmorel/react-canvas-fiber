import React from "react";

export function useRef<T>(defaultValue?: T): React.MutableRefObject<T> {
  // @ts-ignore
  return React.useRef(defaultValue ?? null);
}
