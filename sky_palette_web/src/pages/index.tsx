import Image from "next/image";
import { Inter } from "next/font/google";
import useSWR from "swr";
import { ColorArea } from "@react-spectrum/color";
import { parseColor } from "@react-stately/color";
import { forwardRef, useEffect, useState } from "react";
import { Button } from "@adobe/react-spectrum";
import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import { useRouter } from "next/router";
import { onTheLeft, onTheRight } from "@/config";

const inter = Inter({ subsets: ["latin"] });

//Write a fetcher function to wrap the native fetch function and return the result of a call to url in json format
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const maxColorQueries = 2;

type IndexPageProps = {};
type IndexPageRef = React.ForwardedRef<HTMLDivElement>;

function Home(props: IndexPageProps, ref: IndexPageRef) {
  const { data, error } = useSWR("/api/color", fetcher);
  const router = useRouter();
  let [currentValue, setCurrentValue] = useState(
    parseColor("hsl(50, 100%, 50%)")
  );
  const [colorQueries, setColorQueries] = useState<Map<number, string>>(
    new Map([[0, "hsl(50, 100%, 50%)"]])
  );
  const [selectedColorQueryIndex, setSelectedColorQueryIndex] = useState(0);

  useEffect(() => {
    const colorQuery = colorQueries.get(selectedColorQueryIndex);
    if (colorQuery) {
      setCurrentValue(parseColor(colorQuery));
    }
  }, [selectedColorQueryIndex]);

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
              router.push("/palette");
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
