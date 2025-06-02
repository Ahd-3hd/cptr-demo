/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, type ActionDispatch } from "react";
import type { State } from "../App";

export const AppContext = createContext<State | null>(null);
export const AppDispatchContext = createContext<ActionDispatch<
  [action: { type: string; value: any }]
> | null>(null);
