import * as React from "react";
import ResizeObserver from "resize-observer-polyfill";
import { Canvas } from "./components/Canvas";
import { StoreContext } from "./useStore";
import { observer } from "mobx-react";
import { Item } from "./components/Item";
import { Store } from "./models/store";
import { useSingleton } from "./hooks/useSingleton";
import { identityMatrix } from "./constants/defaultValues";
import { FpsCounter } from "./components/FpsCounter";

export const App = observer(function App() {
  const store = useSingleton(() => new Store());

  const refContainer = React.useRef<HTMLElement>(null);
  React.useLayoutEffect(() => {
    const element = refContainer.current;
    if (!element) return;
    const resizeObserver = new ResizeObserver(
      (entries: ResizeObserverEntry[]) => {
        if (!Array.isArray(entries) || !entries.length) {
          return;
        }
        const entry = entries[0];
        store.setSize(
          Math.floor(entry.contentRect.width),
          Math.floor(entry.contentRect.height)
        );
      }
    );
    resizeObserver.observe(element);
    return () => {
      resizeObserver.unobserve(element);
    };
  }, []);

  return (
    <StoreContext.Provider value={store}>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
        }}
      >
        <header
          style={{
            flex: "none",
            position: "relative",
            background: "#FAB3A9",
            display: "flex",
            padding: 5,
            alignItems: "center",
          }}
        >
          <h1 style={{ margin: 0, flex: 1 }}>Canvas</h1>
          <h3 style={{ margin: 0 }}>
            <FpsCounter />
          </h3>
          <button
            type="button"
            style={{ margin: 5 }}
            onClick={() => store.setSceneTransformMatrix(identityMatrix)}
          >
            Reset position
          </button>
        </header>
        <main
          ref={refContainer}
          style={{ display: "flex", flex: "1", position: "relative" }}
        >
          {!!store.width && !!store.height && (
            <Canvas>
              {store.items.map((item) => (
                <Item key={item.id} item={item} />
              ))}
            </Canvas>
          )}
        </main>
      </div>
    </StoreContext.Provider>
  );
});
