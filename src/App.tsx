import * as React from "react";
import ResizeObserver from "resize-observer-polyfill";
import { Canvas } from "./Canvas";
import { StoreContext } from "./useStore";
import { observer } from "mobx-react";
import { Scene } from "./components/Scene";
import { Item } from "./components/Item";
import { Store } from "./models/store";
import { useSingleton } from "./hooks/useSingleton";
import { identityMatrix } from "./constants/defaultValues";

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
            background: "red",
            display: "flex",
            padding: 5,
          }}
        >
          <h1 style={{ background: "red", margin: 0, flex: 1 }}>Test !</h1>
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
            <Canvas
              width={store.width}
              height={store.height}
              style={{ userSelect: "none" }}
              onClick={(ev) => {
                ev.preventDefault();
                store.items[0].set({
                  color: store.items[0].color === "blue" ? "green" : "blue",
                });
                store.items[1].set({
                  left:
                    store.items[1].left > 200 ? 50 : store.items[1].left + 10,
                });
              }}
            >
              {/* Have to repeat the provider here because we lost context by changing reconciler */}
              <StoreContext.Provider value={store}>
                <Scene>
                  {store.items.map((item) => (
                    <Item key={item.id} item={item} />
                  ))}
                </Scene>
              </StoreContext.Provider>
            </Canvas>
          )}
        </main>
      </div>
    </StoreContext.Provider>
  );
});
