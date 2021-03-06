import * as React from "react";
import ResizeObserver from "resize-observer-polyfill";
import { Canvas } from "./Canvas";
import reactImageUrl from "./react.png";

const itemText1 = {
  id: "1",
  kind: "text" as const,
  left: 40,
  top: 50,
  width: 300,
  height: 180,
  color: "green",
  text: "Hello",
};

const itemText2 = {
  id: "2",
  kind: "text" as const,
  left: 40,
  top: 240,
  width: 300,
  height: 180,
  color: "red",
  text: "World",
};

const itemImage1 = {
  id: "3",
  kind: "image" as const,
  left: 40,
  top: 450,
  width: 300,
  height: 180,
  color: "red",
  imageUrl: reactImageUrl,
};

const defaultItems = [itemText1, itemText2, itemImage1];

type Item = typeof itemText1 | typeof itemImage1;

export function App() {
  const refContainer = React.useRef<HTMLElement>(null);
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

  const [items, setItems] = React.useState(() => defaultItems);

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

function Rectangle({ item }: { item: Item }) {
  const { width, height, left, top, color } = item;
  return (
    <c-view
      style={{
        width,
        height,
        backgroundColor: "yellow",
        justifyContent: "center",
        transform: {
          matrix: [1, 0, 0, 1, left, top],
        },
        padding: 20,
        borderRadius: 5,
      }}
    >
      <c-view
        style={{
          flex: 1,
          backgroundColor: color,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 5,
        }}
      >
        {item.kind === "image" ? (
          <c-image
            imageUrl={item.imageUrl}
            style={{ flex: 1, width: "100%", height: "100%" }}
          />
        ) : (
          <c-text text={item.text} style={{ color: "white", fontSize: 32 }} />
        )}
      </c-view>
    </c-view>
  );
}
