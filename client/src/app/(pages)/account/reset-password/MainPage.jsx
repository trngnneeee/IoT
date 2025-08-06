"use client"

import { useEffect } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import { ResetPasswordForm } from "./ResetPasswordForm"
import { useRouter } from "next/navigation";

export const MainPage = () => {
  const router = useRouter();
  const { isLogin, infoUser, isLoading } = useAuth();

  useEffect(() => {
    if (!isLogin && !isLoading) router.push("/account/login");
  }, [isLogin, isLoading, router]);

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      {isLogin && (
        <>
          <div className="bg-[url('/login.png')] h-screen bg-cover bg-center bg-no-repeat">
            <div className="flex justify-center xl:justify-between gap-[400px] xl:px-[150px] pt-[100px]">
              <div className="hidden xl:block">
                <div className="text-[45px] text-white font-bold">Group</div>
                <div className="text-[40px] text-white font-bold">Smart Trash Bin</div>
              </div>
              <div className="w-full sm:w-[650px] bg-white mx-[30px] sm:mx-0 px-[30px] sm:px-[70px] py-[50px] sm:py-[80px] rounded-[20px] shadow-2xl">
                <div className="text-[#505050] font-semibold text-[20px] sm:text-[36px] mb-[30px] sm:mb-[50px]">RESET PASSWORD</div>
                <ResetPasswordForm />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}