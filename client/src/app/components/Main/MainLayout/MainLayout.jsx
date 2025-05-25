"use client"

import { Sider } from "./../../../components/Dashboard/Sider/Sider"
import { Header } from "../../../components/Home/Header/Header"
import { Footer } from "../../../components/Home/Footer/Footer"
import { usePathname } from "next/navigation";

export const MainLayout = ({ children }) => {
  const pathName = usePathname();

  return (
    <>
      {pathName.startsWith("/dashboard") ? (
        <>
          <Sider />
          {children}
        </>
      ) : (
        <>
          <Header />
          {children}
          <Footer />
        </>
      )}
    </>
  );
};