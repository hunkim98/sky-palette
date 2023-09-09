import { ColorRgb } from "@/utils/color";
import { parseSkyInfo } from "@/utils/skyData";
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import useSWR from "swr";

export interface ColorContextProps {
  colorQueries: Map<number, string>;
  setColorQueries: (colorQueries: Map<number, string>) => void;
  skyColorData: Record<string, Array<ColorRgb>> | undefined;
  skyPaletteKey: string | undefined;
  setSkyPaletteKey: (key: string) => void;
  colorPalette: ColorRgb[];
  colorOrigin?: {
    lat: number;
    lng: number;
    state?: string;
    time?: string;
    sunStatus?: string;
  };
  selectedPaletteColorIndex: number;
  setSelectedPaletteColorIndex: (index: number) => void;
}

const ColorContext = createContext<ColorContextProps>({} as ColorContextProps);

interface Props {
  children: React.ReactNode;
}
//Write a fetcher function to wrap the native fetch function and return the result of a call to url in json format
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ColorContextProvider = ({ children }: Props) => {
  const { data: skyColorData, error } = useSWR<Record<string, Array<ColorRgb>>>(
    "/api/color",
    fetcher
  );
  const fetchSkyPictureLatLng = async (address: string) => {
    const response = await axios.post("/api/location", {
      address,
    });
    return response.data as { lat: number; lng: number };
  };
  const [colorOrigin, setColorOrigin] = useState<{
    lat: number;
    lng: number;
    state?: string;
    time?: string;
    sunStatus?: string;
  }>();
  const [colorQueries, setColorQueries] = useState<Map<number, string>>(
    new Map([[0, "hsl(50, 100%, 50%)"]])
  );
  const [colorPalette, setColorPalette] = useState<ColorRgb[]>([]);
  const [skyPaletteKey, setSkyPaletteKey] = useState<string>();
  const [selectedPaletteColorIndex, setSelectedPaletteColorIndex] =
    useState<number>(0);
  useEffect(() => {
    if (skyColorData && skyPaletteKey) {
      const palette = skyColorData[skyPaletteKey];
      if (palette) {
        setColorPalette(palette);
      }
      setSelectedPaletteColorIndex(0);
      const { city, state, time, sunStatus } = parseSkyInfo(skyPaletteKey);
      fetchSkyPictureLatLng(`${city}, ${state}`).then(({ lat, lng }) => {
        setColorOrigin({ lat, lng, state, time, sunStatus });
      });
    }
  }, [skyPaletteKey, skyColorData]);
  return (
    <ColorContext.Provider
      value={{
        colorQueries,
        setColorQueries,
        skyColorData: skyColorData,
        skyPaletteKey: skyPaletteKey,
        setSkyPaletteKey: setSkyPaletteKey,
        colorPalette,
        colorOrigin,
        selectedPaletteColorIndex,
        setSelectedPaletteColorIndex,
      }}
    >
      {children}
    </ColorContext.Provider>
  );
};

export { ColorContext, ColorContextProvider };
