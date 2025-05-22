"use client"

import { ResetPasswordForm } from "./ResetPasswordForm"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export const MainPage = () => {
  const router = useRouter();
  const [load, setLoad] = useState(false);


  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/verifyToken`, {
      method: "POST",
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.code == "error")
          router.push("/account/login");
        else setLoad(true);
      })
  }, []);

  return (
    <>
      {load && (
        <div className="bg-[url('/login.png')] h-screen bg-cover bg-center bg-no-repeat">
          <div className="flex justify-between gap-[400px] px-[150px] pt-[100px]">
            <div className="">
              <div className="text-[45px] text-white font-bold">Group</div>
              <div className="text-[40px] text-white font-bold">Product's Name</div>
            </div>
            <div className="w-[650px] bg-white px-[70px] py-[80px] rounded-[20px] shadow-2xl">
              <div className="text-[#505050] font-semibold text-[36px] mb-[50px]">RESET PASSWORD</div>
              <ResetPasswordForm />
            </div>
          </div>
        </div>
      )}
    </>
  );
}