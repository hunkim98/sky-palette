import PageTransition from "@/components/PageTransition";
import { onTheLeft, onTheRight } from "@/config";
import { useRouter } from "next/router";
import React, { forwardRef, useContext, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ColorContext } from "@/context/ColorContext";
import MapChart from "@/components/MapChart";
import BackAndroid from "@spectrum-icons/workflow/BackAndroid";
import Canvas from "@/components/Canvas";

type PalettePageProps = {};
type PalettePageRef = React.ForwardedRef<HTMLDivElement>;

function Palette(props: PalettePageProps, ref: PalettePageRef) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paletteKey = searchParams.get("key");
  const {
    skyColorData,
    selectedPaletteColorIndex,
    setSelectedPaletteColorIndex,
    setSkyPaletteKey,
    skyPaletteKey,
    colorPalette,
    colorOrigin,
  } = useContext(ColorContext);
  useEffect(() => {
    if (!skyPaletteKey && paletteKey) {
      setSkyPaletteKey(paletteKey);
    }
  }, [paletteKey]);

  return (
    <PageTransition ref={ref} exit={onTheRight}>
      <main className="flex min-h-screen flex-col items-center pt-24">
        <div className="w-full items-stretch max-w-[1000px] relative flex justify-center flex-wrap gap-5">
          <div className="">
            <div
              className="absolute left-0 flex gap-2 center justify-center items-center pl-2"
              onClick={() => {
                router.push("/");
              }}
            >
              <BackAndroid size="S" />
              <span
                style={{
                  fontSize: 15,
                }}
              >
                Go back
              </span>
            </div>
          </div>
          <div className="flex-col w-[400px] max-w-[400px] mt-10 items-center">
            {colorOrigin && (
              <div className="align-center text-center">
                You are viewing the palette of {colorOrigin.state}&apos;s sky at{" "}
                {colorOrigin.time}{" "}
              </div>
            )}
            <MapChart />
            <div className="flex w-full">
              {colorPalette.map((color, idx) => {
                const colorPercentage = (1 / colorPalette.length) * 100;
                return (
                  <div
                    onClick={() => {
                      setSelectedPaletteColorIndex(idx);
                    }}
                    key={`${color.r}${color.g}${color.b}`}
                    className={`grow h-24 cursor-pointer`}
                    style={{
                      border:
                        idx === selectedPaletteColorIndex
                          ? "2px solid black"
                          : "",
                      backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
                    }}
                  ></div>
                );
              })}
            </div>
          </div>

          <Canvas />
        </div>
      </main>
    </PageTransition>
  );
}

export default forwardRef(Palette);
