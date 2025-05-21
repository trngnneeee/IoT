import "./globals.css";
import { AOSConfig } from "./AOS.config"

export const metadata = {
  title: "Home"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <AOSConfig/>
      <body className="relative bg-[#e6f3f58b]">
        {children}
      </body>
    </html>
  );
}
