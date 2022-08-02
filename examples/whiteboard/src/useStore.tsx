import { createContext, useContext } from "react";
import { Store } from "./models/store";

export const StoreContext = createContext<Store>(null as any);

export function useStore() {
  return useContext(StoreContext);
}
