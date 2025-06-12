/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext } from "react";
import type { State } from "../App";

export const AppContext = createContext<State | null>(null);
export const AppDispatchContext = createContext<React.Dispatch<{
  type: string;
  value: any;
}> | null>(null);
