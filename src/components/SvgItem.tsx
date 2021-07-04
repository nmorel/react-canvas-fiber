import * as React from "react";
import { observer } from "mobx-react";
import { SvgItem as ISvgItem } from "../models/item";

export const SvgItem = observer(function SvgItem({ item }: { item: ISvgItem }) {
  const {
    left,
    top,
    scale,
    width,
    height,
    commands,
    strokeWidth,
    color,
  } = item;
  return (
    <c-svg
      transformMatrix={[scale, 0, 0, scale, left, top]}
      width={width}
      height={height}
    >
      <c-svg-path
        commands={commands}
        strokeWidth={strokeWidth}
        strokeColor={color}
      />
    </c-svg>
  );
});
