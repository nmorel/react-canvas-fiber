import * as React from "react";
import ResizeObserver from "resize-observer-polyfill";
import { createAsset } from "use-asset";
import { Canvas } from "./Canvas";
import largeImagePlaceholder from "./react.png";
import largeImage from "./large_image_original.jpeg";

const itemText1 = {
  id: "1",
  kind: "text" as const,
  left: 40,
  top: 50,
  width: 300,
  height: 180,
  scale: 1,
  color: "green",
  text: "Hello",
};

const itemText2 = {
  id: "2",
  kind: "text" as const,
  left: 40,
  top: 260,
  width: 300,
  height: 180,
  scale: 0.8,
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
  scale: 1.5,
  color: "red",
  placeholderUrl: largeImagePlaceholder,
  imageUrl: largeImage,
};

const defaultItems = [itemText1, itemText2, itemImage1];

type Item = typeof itemText1 | typeof itemImage1;

export function App() {
  const refContainer = React.useRef<HTMLElement>(null);
  const [{ width, height }, setSize] = React.useState({ width: 0, height: 0 });
  React.useLayoutEffect(() => {
    const element = refContainer.current;
    if (!element) return;
    const resizeObserver = new ResizeObserver(
      (entries: ResizeObserverEntry[]) => {
        if (!Array.isArray(entries) || !entries.length) {
          return;
        }
        const entry = entries[0];
        setSize({
          width: Math.floor(entry.contentRect.width),
          height: Math.floor(entry.contentRect.height),
        });
      }
    );
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
        <h1
          onClick={(evt) => {
            evt.preventDefault();
            console.log("text click", { ...evt });
          }}
          onDoubleClickCapture={(evt) => {
            console.log("text doubleclick", { ...evt });
            evt.stopPropagation();
          }}
        >
          Test !
          <button
            onPointerDown={() => console.log("button down")}
            onPointerUp={() => console.log("button up")}
            onClick={(evt) => {
              evt.stopPropagation();
              evt.preventDefault();
            }}
            onDoubleClick={(evt) => console.log("button doubleclick")}
          >
            Hello
          </button>
        </h1>
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
  const { width, height, left, top, color, scale } = item;
  return (
    <c-view
      position="absolute"
      top={0}
      left={0}
      width={width}
      height={height}
      borderColor="red"
      borderWidth={2}
      backgroundColor="yellow"
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
              <React.Suspense fallback={null}>
                <Image
                  src={item.placeholderUrl}
                  flex={1}
                  width="100%"
                  height="100%"
                />
              </React.Suspense>
            }
          >
            <Image src={item.imageUrl} flex={1} width="100%" height="100%" />
          </React.Suspense>
        ) : (
          <c-text text={item.text} color="white" fontSize={32} />
        )}
      </c-view>
    </c-view>
  );
}

function useIsPressed() {
  const [isPressed, setIsPressed] = React.useState(false);
  React.useLayoutEffect(() => {
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

const imageAsset = createAsset((src: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => {
      image.onload = null;
      image.onerror = null;
      resolve(image);
    };
    image.onerror = () => {
      image.onload = null;
      image.onerror = null;
      reject();
    };
    image.src = src;
  });
});

function Image({
  src,
  ...props
}: Omit<JSX.IntrinsicElements["c-image"], "image"> & { src: string }) {
  const image = imageAsset.read(src);
  return <c-image image={image} {...props} />;
}
