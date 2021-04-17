import { useState, useLayoutEffect } from "react";

export function useIsPressed() {
  const [isPressed, setIsPressed] = useState(false);
  useLayoutEffect(() => {
    if (!isPressed) return;
    const onUp = () => setIsPressed(false);
    document.addEventListener("pointerup", onUp);
    return () => document.removeEventListener("pointerup", onUp);
  }, [isPressed]);
  return {
    isPressed,
    onPointerDown: () => setIsPressed(true),
  };
}
