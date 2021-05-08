import * as React from "react";
import { IItem } from "../models/item";
import { useIsOver } from "../hooks/useIsOver";
import { useIsPressed } from "../hooks/useIsPressed";
import { observer } from "mobx-react";
import { Image } from "./Image";

export const Item = observer(function Item({ item }: { item: IItem }) {
  const { width, left, top, color, scale } = item;
  const { isOver, ...handlers } = useIsOver();
  return (
    <c-view
      position="absolute"
      top={0}
      left={0}
      width={width}
      minHeight={120}
      borderColor={isOver ? "black" : "#C6AD94"}
      borderWidth={4}
      backgroundColor="#C6AD94"
      justifyContent="center"
      transformMatrix={[scale, 0, 0, scale, left, top]}
      padding={20}
      borderRadius={10}
      onTap={(evt) => {
        if (evt.detail > 1) {
          console.log("ignoring tap on parent", evt.detail);
        } else {
          console.log("tap parent", evt.detail);
        }
      }}
      onDoubleTap={(evt) => console.log("double tap parent", evt.detail)}
      {...handlers}
    >
      <Pastille />
      <c-view
        flex={1}
        backgroundColor={color}
        justifyContent="center"
        alignItems="center"
        borderRadius={10}
      >
        {item.kind === "image" ? (
          <React.Suspense
            fallback={
              item.placeholderUrl ? (
                <React.Suspense fallback={null}>
                  <Image
                    src={item.placeholderUrl}
                    flex={1}
                    width="100%"
                    height="100%"
                  />
                </React.Suspense>
              ) : null
            }
          >
            <Image src={item.imageUrl} flex={1} width="100%" height="100%" />
          </React.Suspense>
        ) : (
          <c-text
            text={item.text}
            color="white"
            fontSize={24}
            fontFamily={"Helvetica Neue"}
            textAlign={"center"}
            padding={12}
          />
        )}
      </c-view>
    </c-view>
  );
});

function Pastille() {
  const { isPressed, ...handlers } = useIsPressed();
  return (
    <c-view
      backgroundColor={isPressed ? "red" : "green"}
      justifyContent="center"
      alignItems="center"
      position="absolute"
      right={10}
      top={10}
      width={10}
      height={10}
      borderRadius={5}
      {...handlers}
    />
  );
}
