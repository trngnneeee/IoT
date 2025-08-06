"use client"

import { Sider } from "./../../../components/Dashboard/Sider/Sider"
import { Header } from "../../../components/Home/Header/Header"
import { Footer } from "../../../components/Home/Footer/Footer"
import { usePathname } from "next/navigation";

export const MainLayout = ({ children }) => {
  const pathName = usePathname();

  return (
    <>
      {pathName.startsWith("/account") ? (
        <>
          {children}
        </>
      ) : (
        <>
          {pathName.startsWith("/dashboard") || pathName.startsWith("/control") ? (
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
      )}
    </>
  );
};