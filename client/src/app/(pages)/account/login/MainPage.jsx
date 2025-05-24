"use client"

import Link from "next/link";
import { LoginForm } from "./LoginForm"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
        if (data.code == "error") {
          setLoad(true);
        }
        else {
          router.push("/");
        }
      })
  }, []);

  return (
    <>
      {load && (
        <div className="bg-[url('/login.png')] w-full h-screen bg-cover bg-center bg-no-repeat">
          <div className="flex justify-center xl:justify-between gap-[400px] xl:px-[150px] pt-[100px]">
            <div className="hidden xl:block">
              <div className="text-[45px] text-white font-bold">Group</div>
              <div className="text-[40px] text-white font-bold">Product's Name</div>
            </div>
            <div className="w-full sm:w-[650px] bg-white mx-[30px] sm:mx-0 px-[30px] sm:px-[70px] py-[50px] sm:py-[80px] rounded-[20px] shadow-2xl">
              <div className="text-[#505050] font-semibold text-[24px] sm:text-[36px] mb-[30px] sm:mb-[50px]">LOGIN</div>
              <LoginForm />
              <div className="mt-[30px] sm:mt-[50px] flex justify-center items-center gap-[5px]">
                <div className="text-[10px] sm:text-[16px] text-[#505050]">You don't have an account?</div>
                <Link className="text-[10px] sm:text-[16px] text-[#0040ff] underline" href="/account/register">Sign in</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}