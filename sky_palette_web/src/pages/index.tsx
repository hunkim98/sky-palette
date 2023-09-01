import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center p-24 ${inter.className}`}
    >
      <h1>Sky Palette</h1>
      <div>
        <h2>Select Two Colors For Getting a gradient palette</h2>
      </div>
    </main>
  );
}
