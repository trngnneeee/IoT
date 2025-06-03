"use client"

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react"

export const useAuth = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [infoUser, setInfoUser] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const pathName = usePathname();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/verifyToken`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.code == "error")
        {
        }
        if (data.code == "success")
        {
          setInfoUser(data.infoUser);
          setIsLogin(true);
        }
        setIsLoading(false);
      })
  }, [pathName]);

  return { isLogin, infoUser, isLoading };
}