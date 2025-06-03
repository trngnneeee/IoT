import "./globals.css";
import { AOSConfig } from "./AOS.config"
import { MainLayout } from "./components/Main/MainLayout/MainLayout";

export const metadata = {
  title: "Home"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <AOSConfig/>
      <body className="relative bg-[#e6f3f58b]">
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}
