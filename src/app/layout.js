import "./globals.css";
import { ThemeSelect } from "./component/ThemeSelect/ThemeSelect"

export default function RootLayout({ children }) {
  return (
    <html data-theme="cupcake" lang="en">
      <body className="relative bg-[#F3F4F6]">
        <ThemeSelect/>

        {children}
      </body>
    </html>
  );
}
