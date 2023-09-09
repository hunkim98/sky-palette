import Image from "next/image";
import { Inter } from "next/font/google";
import useSWR from "swr";
import { ColorArea } from "@react-spectrum/color";
import { parseColor } from "@react-stately/color";
import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Button } from "@adobe/react-spectrum";
import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import { useRouter } from "next/router";
import { onTheLeft, onTheRight } from "@/config";
import { ColorContext } from "@/context/ColorContext";
import { ColorRgb, findColorDifference } from "@/utils/color";
import { color } from "framer-motion";

const inter = Inter({ subsets: ["latin"] });

const maxColorQueries = 2;

type IndexPageProps = {};
type IndexPageRef = React.ForwardedRef<HTMLDivElement>;

function Home(props: IndexPageProps, ref: IndexPageRef) {
  const router = useRouter();
  let [currentValue, setCurrentValue] = useState(
    parseColor("hsl(50, 100%, 50%)")
  );
  const { colorQueries, setColorQueries, skyColorData, setSkyPaletteKey } =
    useContext(ColorContext);
  const [selectedColorQueryIndex, setSelectedColorQueryIndex] = useState(0);

  useEffect(() => {
    const colorQuery = colorQueries.get(selectedColorQueryIndex);
    if (colorQuery) {
      setCurrentValue(parseColor(colorQuery));
    }
  }, [selectedColorQueryIndex]);

  const extractRgbsOfCurrentSelection = useCallback(
    (queries: Map<number, string>) => {
      const colorQueries = Array.from(queries.values());
      const rgbValues = colorQueries.map((colorQuery) => {
        const color = parseColor(colorQuery).toString("rgb");
        const rgbStringErased = color.replace("rgb(", "");
        const endBracketRemoved = rgbStringErased.replace(")", "");
        const rgb = endBracketRemoved.split(",");
        const r = parseInt(rgb[0]);
        const g = parseInt(rgb[1]);
        const b = parseInt(rgb[2]);
        return { r, g, b };
      });
      return rgbValues;
    },
    []
  );

  const findPaletteForColorRgbs = useCallback(
    (colorRgbs: { r: number; g: number; b: number }[]) => {
      if (!skyColorData) {
        return {
          key: "",
          value: Number.MAX_SAFE_INTEGER,
        };
      }
      const keys = Object.keys(skyColorData);
      const minKey = {
        key: "",
        value: Number.MAX_SAFE_INTEGER,
      };
      for (const key of keys) {
        const rgbArrayOfData = (skyColorData[key] as ColorRgb[]).map(
          (colorRgb) => {
            return colorRgb;
          }
        );
        // find totalMinDifferece
        const colorMinDiff = new Map<number, number>(
          colorRgbs.map((_, idx) => {
            return [idx, Number.MAX_SAFE_INTEGER];
          })
        );
        // we check the min difference for each color
        for (const rgb of rgbArrayOfData) {
          const r = rgb.r;
          const g = rgb.g;
          const b = rgb.b;
          for (let i = 0; i < colorRgbs.length; i++) {
            const colorRgb = colorRgbs[i];
            const diff = findColorDifference(colorRgb, { r, g, b });
            const currentDiff = colorMinDiff.get(i);
            if (currentDiff) {
              if (diff < currentDiff) {
                colorMinDiff.set(i, diff);
              }
            } else {
              colorMinDiff.set(i, diff);
            }
          }
        }
        const totalMinDiff = Array.from(colorMinDiff.values()).reduce(
          (acc, cur) => {
            return acc + cur;
          }
        );
        if (totalMinDiff < minKey.value) {
          minKey.key = key;
          minKey.value = totalMinDiff;
        }
      }
      return minKey;
    },
    [skyColorData]
  );

  return (
    <PageTransition ref={ref} exit={onTheLeft} initial={onTheLeft}>
      <main
        className={`flex min-h-screen flex-col items-center p-24 ${inter.className}`}
      >
        <h1>Sky Palette</h1>
        <div>
          <h2>Select Two Colors For Getting a gradient palette</h2>
        </div>
        <div className="flex flex-col gap-4 pt-8 items-center">
          <ColorArea
            value={currentValue}
            onChange={setCurrentValue}
            onChangeEnd={(color) => {
              const newColorQueries = new Map(colorQueries);
              newColorQueries.set(
                selectedColorQueryIndex,
                color.toString("hsl")
              );
              setColorQueries(newColorQueries);
            }}
          />
          <div className="flex gap-2">
            {Array.from(Array(maxColorQueries).keys()).map((i) => {
              return (
                <div
                  key={i}
                  className={`w-24 h-24 ${
                    inter.className
                  } rounded-[50%] border-2 ${
                    i === selectedColorQueryIndex
                      ? "border-black"
                      : "border-gray-300"
                  } text-center flex justify-center items-center text-xs px-2`}
                  style={{
                    backgroundColor: colorQueries.get(i)
                      ? parseColor(colorQueries.get(i)!).toString("hex")
                      : "",
                  }}
                  onClick={() => {
                    setSelectedColorQueryIndex(i);
                  }}
                >
                  {selectedColorQueryIndex !== i && !colorQueries.get(i)
                    ? "Select to change"
                    : ""}
                </div>
              );
            })}
          </div>
          <Button
            variant="primary"
            onPress={() => {
              const rgbs = extractRgbsOfCurrentSelection(colorQueries);
              const skyPaletteKeyResult = findPaletteForColorRgbs(rgbs);
              setSkyPaletteKey(skyPaletteKeyResult.key);
              router.push(`/palette?key=${skyPaletteKeyResult.key}`);
            }}
          >
            Proceed to generate palette
          </Button>
        </div>
      </main>
    </PageTransition>
  );
}

export default forwardRef(Home);
