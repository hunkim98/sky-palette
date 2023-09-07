import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SSRProvider, Provider, defaultTheme } from "@adobe/react-spectrum";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SSRProvider>
      <Provider theme={defaultTheme} colorScheme="light">
        <Component {...pageProps} />
      </Provider>
    </SSRProvider>
  );
}
