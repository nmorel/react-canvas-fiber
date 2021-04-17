import { observer } from "mobx-react";
import React from "react";
import { Store } from "../models/store";
import { useStore } from "../useStore";
import { round } from "lodash-es";

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
      onWheel={(evt) => {
        const delta = evt.nativeEvent.deltaY;
        let newScale = store.sceneTransformMatrix[0];
        if (delta > 0 && newScale > 0.01) {
          if (delta <= 0.1) {
            newScale -= 0.01;
          } else {
            newScale -= 0.1;
          }
        } else if (delta < 0 && newScale < 10) {
          if (newScale > 0.1) {
            newScale += 0.1;
          } else {
            newScale += 0.01;
          }
        }
        newScale = round(newScale, 2);

        if (newScale === store.sceneTransformMatrix[0] || newScale <= 0) {
          return;
        }

        const positionCurrentZoom = {
          x:
            (evt.canvasX - store.sceneTransformMatrix[4]) /
            store.sceneTransformMatrix[0],
          y:
            (evt.canvasY - store.sceneTransformMatrix[5]) /
            store.sceneTransformMatrix[3],
        };
        const positionNewZoom = {
          x: positionCurrentZoom.x * newScale,
          y: positionCurrentZoom.y * newScale,
        };

        const newMatrix: Store["sceneTransformMatrix"] = [
          ...store.sceneTransformMatrix,
        ];
        newMatrix[0] = newScale;
        newMatrix[3] = newScale;
        newMatrix[4] = Math.round(evt.canvasX - positionNewZoom.x);
        newMatrix[5] = Math.round(evt.canvasY - positionNewZoom.y);
        store.setSceneTransformMatrix(newMatrix);
      }}
    >
      <c-view transformMatrix={store.sceneTransformMatrix}>{children}</c-view>
    </c-view>
  );
});
