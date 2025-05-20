"use client"

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/home`, {
      method: "POST",
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.code == "error")
        {
          router.push("/account/login");
        }
      })
  }, []);

  return <h1>Trang chủ</h1>;
}