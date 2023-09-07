import PageTransition from "@/components/PageTransition";
import { onTheLeft, onTheRight } from "@/config";
import { useRouter } from "next/router";
import React, { forwardRef } from "react";

type PalettePageProps = {};
type PalettePageRef = React.ForwardedRef<HTMLDivElement>;

function Palette(props: PalettePageProps, ref: PalettePageRef) {
  const router = useRouter();
  return (
    <PageTransition ref={ref} exit={onTheRight}>
      <main className="flex min-h-screen flex-col items-center p-24">
        <div
          onClick={() => {
            router.push("/");
          }}
        >
          result
        </div>
      </main>
    </PageTransition>
  );
}

export default forwardRef(Palette);
