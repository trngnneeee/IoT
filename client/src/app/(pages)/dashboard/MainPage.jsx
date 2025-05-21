"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const MainPage = () => {
  const [load, setLoad] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/verifyToken`, {
      method: "POST",
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.code == "error")
        {
          router.push("/account/login");
        }
        else setLoad(true);
      })
  }, []);
  
  return (
    <>  
      {load && (
        <h1>Dashboard</h1>
      )}
    </>
  );
}