"use client"

import { useAuth } from "../../../../hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const MainRegisterInitPage = () => {
  const router = useRouter();
  const { isLogin, infoUser, isLoading } = useAuth();

  useEffect(() => {
    if (isLogin && !isLoading) router.push("/");
  }, [isLogin, isLoading, router]);

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      {!isLogin && (
        <div className="bg-[url('/login.png')] h-screen bg-cover bg-center bg-no-repeat">
          <div className="flex justify-center xl:justify-between gap-[400px] xl:px-[150px] pt-[100px]">
            <div className="xl:block hidden">
              <div className="text-[45px] text-white font-bold">Group</div>
              <div className="text-[40px] text-white font-bold">Product's Name</div>
            </div>
            <div className="w-full sm:w-[650px] bg-white mx-[30px] sm:mx-0 px-[30px] sm:px-[70px] py-[50px] sm:py-[80px] rounded-[20px] shadow-2xl">
              <div className="text-[#505050] font-semibold text-[16px] sm:text-[36px] mb-[30px] sm:mb-[50px] text-center">REGISTER SUCCESSFULLY</div>
              <div className="text-[14px] sm:text-[20px] text-[#505050] text-center w-full">Account is being approved!</div>
              <div className="mt-[30px] sm:mt-[50px] flex justify-center items-center gap-[5px]">
                <div className="text-[10px] sm:text-[16px] text-[#505050]">Already have an account?</div>
                <Link className="text-[10px] sm:text-[16px] text-[#0040ff] underline" href="/account/login">Login</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}