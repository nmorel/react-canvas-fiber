import { observer } from "mobx-react";
import React from "react";
import { useStore } from "../useStore";

export const Scene = observer(function Scene({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = useStore();
  return (
    <c-view
      width={store.width}
      height={store.height}
      transformMatrix={store.sceneTransformMatrix}
    >
      {children}
    </c-view>
  );
});
