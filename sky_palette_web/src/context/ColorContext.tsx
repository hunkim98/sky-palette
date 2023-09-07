import { createContext } from "react";

export interface ColorContextProps {}

export const ColorContext = createContext<ColorContextProps>(
  {} as ColorContextProps
);
