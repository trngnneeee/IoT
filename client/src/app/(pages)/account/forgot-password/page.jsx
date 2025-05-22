import Link from "next/link";
import { ForgotPasswordForm } from "./ForgotPasswordForm"

export const metadata = {
  title: "Forgot Password"
};

export default function Home() {
  return (
    <>
      <div className="bg-[url('/login.png')] h-screen bg-cover bg-center bg-no-repeat">
        <div className="flex justify-between gap-[400px] px-[150px] pt-[100px]">
          <div className="">
            <div className="text-[45px] text-white font-bold">Group</div>
            <div className="text-[40px] text-white font-bold">Product's Name</div>
          </div>
          <div className="w-[650px] bg-white px-[70px] py-[80px] rounded-[20px] shadow-2xl">
            <div className="text-[#505050] font-semibold text-[36px] mb-[50px]">FORGOT PASSWORD</div>
            <ForgotPasswordForm />
            <div className="mt-[50px] flex justify-center items-center gap-[5px]">
              <div className="text-[16px] text-[#505050]">Already have an account?</div>
              <Link className="text-[16px] text-[#0040ff] underline" href="/account/login">Login</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
