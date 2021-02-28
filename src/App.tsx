import * as React from "react";
import ResizeObserver from "resize-observer-polyfill";
import { Canvas } from "./Canvas";
import reactImageUrl from "./react.png";

export function App() {
  const refContainer = React.useRef();
  const [{ width, height }, setSize] = React.useState({ width: 0, height: 0 });
  React.useLayoutEffect(() => {
    const element = refContainer.current;
    if (!element) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!Array.isArray(entries) || !entries.length) {
        return;
      }
      const entry = entries[0];
      setSize({
        width: Math.floor(entry.contentRect.width),
        height: Math.floor(entry.contentRect.height),
      });
    });
    resizeObserver.observe(element);
    return () => {
      resizeObserver.unobserve(element);
    };
  }, []);

  const [items, setItems] = React.useState(() => [
    {
      id: "1",
      left: 40,
      top: 50,
      width: 300,
      height: 180,
      text: "Hello",
      color: "green",
    },
    {
      id: "2",
      left: 40,
      top: 240,
      width: 300,
      height: 180,
      text: "World",
      color: "red",
    },
    {
      id: "3",
      left: 40,
      top: 450,
      width: 300,
      height: 180,
      imageUrl: reactImageUrl,
      color: "red",
    },
  ]);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: "column",
      }}
    >
      <header style={{ flex: "none" }}>
        <h1>Test !</h1>
      </header>
      <main ref={refContainer} style={{ display: "flex", flex: "1" }}>
        {!!width && !!height && (
          <Canvas
            width={width}
            height={height}
            style={{ userSelect: "none" }}
            onClick={(ev) => {
              ev.preventDefault();
              setItems((it) => {
                it[0].color = it[0].color === "blue" ? "green" : "blue";
                it[1].left = it[1].left > 200 ? 50 : it[1].left + 10;
                return [...it];
              });
            }}
          >
            {items.map((item) => (
              <Rectangle key={item.id} item={item} />
            ))}
          </Canvas>
        )}
      </main>
    </div>
  );
}

function Rectangle({ item }) {
  const { width, height, left, top, text, imageUrl, color } = item;
  return (
    // @ts-ignore
    <view
      style={{
        width,
        height,
        backgroundColor: "yellow",
        justifyContent: "center",
        // @ts-ignore
        transform: {
          matrix: [1, 0, 0, 1, left, top],
        },
        padding: 20,
        borderRadius: 5,
      }}
    >
      <view
        style={{
          flex: 1,
          backgroundColor: color,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 5,
        }}
      >
        {imageUrl ? (
          <image
            // @ts-ignore
            imageUrl={imageUrl}
            style={{flex: 1, width: '100%', height: '100%'}}
          />
        ) : (
          <text
            // @ts-ignore
            text={text}
            style={{ color: "white", fontSize: 32 }}
          />
        )}
      </view>
    </view>
  );
}
