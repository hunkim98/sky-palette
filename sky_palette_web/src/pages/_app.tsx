import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SSRProvider, Provider, defaultTheme } from "@adobe/react-spectrum";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { ColorContextProvider } from "@/context/ColorContext";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const pageKey = router.asPath;
  return (
    // <SSRProvider>
    <Provider theme={defaultTheme} colorScheme="light">
      <ColorContextProvider>
        <AnimatePresence mode="popLayout" initial={false}>
          <Component {...pageProps} key={pageKey} />
        </AnimatePresence>
      </ColorContextProvider>
    </Provider>
    // </SSRProvider>
  );
}
