import "./globals.css";
import ActivityTicker from "@/components/ActivityTicker";
import Navbar from "@/components/Navbar";
import { Open_Sans } from "next/font/google";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-open-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={openSans.variable}>
      <body>
        <ActivityTicker />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
