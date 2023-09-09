import { createContext, useState } from "react";

export interface ColorContextProps {
  colorQueries: Map<number, string>;
  setColorQueries: (colorQueries: Map<number, string>) => void;
}

const ColorContext = createContext<ColorContextProps>({} as ColorContextProps);

interface Props {
  children: React.ReactNode;
}

const ColorContextProvider = ({ children }: Props) => {
  const [colorQueries, setColorQueries] = useState<Map<number, string>>(
    new Map([[0, "hsl(50, 100%, 50%)"]])
  );
  return (
    <ColorContext.Provider value={{ colorQueries, setColorQueries }}>
      {children}
    </ColorContext.Provider>
  );
};

export { ColorContext, ColorContextProvider };
