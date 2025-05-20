import "./globals.css";

export const metadata = {
  title: "Home"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="relative bg-[#e6f3f58b]">
        {children}
      </body>
    </html>
  );
}
