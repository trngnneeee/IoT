"use client"

import { Sider } from "./../../../components/Dashboard/Sider/Sider"
import { Header } from "../../../components/Home/Header/Header"
import { Footer } from "../../../components/Home/Footer/Footer"
import { usePathname } from "next/navigation";
import { ChatBot } from "../../ChatBot/ChatBot"

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
          {pathName.startsWith("/dashboard") || pathName.startsWith("/control") || pathName.startsWith("/profile") ? (
            <>
              <div className="">
                <Sider />
                <div className="relative">
                  {children}
                </div>
                <div className="absolute bottom-[-80px] right-[50px]">
                  <ChatBot />
                </div>
              </div>
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