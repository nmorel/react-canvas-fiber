import { useState } from "react";

export function useIsOver() {
  const [isOver, setIsOver] = useState(false);
  return {
    isOver,
    onPointerEnter: () => setIsOver(true),
    onPointerLeave: () => setIsOver(false),
  };
}
