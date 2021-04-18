import { useEffect } from "react";
import { useRef } from "../hooks/useRef";
import { padStart } from "lodash-es";
import * as React from "react";

export function FpsCounter(props: JSX.IntrinsicElements["span"]) {
  const ref = useRef<HTMLSpanElement>();
  useEffect(() => {
    let prevTime = performance.now();
    let frames = 0;

    let raf: number;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      frames++;

      const time = performance.now();
      if (time > prevTime + 1000) {
        ref.current.textContent = padStart(
          `${Math.round(Math.max((frames * 1000) / (time - prevTime), 0))} FPS`,
          6,
          "0"
        );
        prevTime = time;
        frames = 0;
      }
    };

    loop();

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <span ref={ref} {...props}>
      00 FPS
    </span>
  );
}
