"use client"

import Link from "next/link";
import { LoginForm } from "./LoginForm"
import { useAuth } from "../../../../hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const MainLoginPage = () => {
  const router = useRouter();
  const { isLogin, infoUser, isLoading } = useAuth();

  useEffect(() => {
    if (isLogin && !isLoading) router.push("/");
  }, [isLogin, isLoading, router])

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      {!isLogin && (
        <>
          <div className="bg-[url('/login.png')] w-full h-screen bg-cover bg-center bg-no-repeat">
            <div className="flex justify-center xl:justify-between gap-[400px] xl:px-[150px] pt-[50px]">
              <div className="hidden xl:block w-[40%]">
                <div className="text-[45px] text-white font-bold">Group</div>
                <div className="text-[40px] text-white font-bold">Smart Trash Bin</div>
              </div>
              <div className="w-full sm:w-[650px] bg-white mx-[30px] sm:mx-0 px-[30px] sm:px-[70px] py-[50px] sm:py-[50px] rounded-[20px] shadow-2xl">
                <div className="text-[#505050] font-semibold text-[24px] sm:text-[36px] mb-[30px] sm:mb-[50px]">LOGIN</div>
                <LoginForm />
                <div className="mt-[30px] sm:mt-[50px] flex justify-center items-center gap-[5px]">
                  <div className="text-[10px] sm:text-[16px] text-[#505050]">You don't have an account?</div>
                  <Link className="text-[10px] sm:text-[16px] text-[#0040ff] underline" href="/account/register">Sign in</Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}