"use client"

import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth"
import { useEffect } from "react";

export const MainPage = () => {
  const router = useRouter();
  const { isLogin, infoUser, isLoading } =  useAuth();

  useEffect(() => {
    if (!isLogin && !isLoading) router.push("/account/login");
  }, [isLogin, router, isLoading]);

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      {isLogin && (
        <>
          
        </>
      )}
    </>
  );
}