"use client"

import { Sider } from "./../../../components/Dashboard/Sider/Sider"
import { usePathname } from "next/navigation";

export const MainLayout = ({children}) => {
  const pathName = usePathname();

  return (
    <>
      {pathName.startsWith("/dashboard") && (<Sider/>)}
      {children}
    </>
  );
};