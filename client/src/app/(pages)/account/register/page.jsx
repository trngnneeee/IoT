import Link from "next/link";
import { IoChevronBack } from "react-icons/io5";
import { RegisterForm } from "./RegisterForm"

export const metadata = {
  title: "Register"
};

export default function Home() {
  return (
    <>
      <div className="bg-[#F3F4F6] w-full h-full absolute">
        <div className="bg-white w-[1000px] h-auto mx-auto my-[100px] p-[40px] flex gap-[40px] rounded-[20px] shadow-xl">
          <div className="w-[400px] h-[500px] rounded-[20px] overflow-hidden shadow-xl">
            <img src="/loginAvt.jpg" className="w-full h-full object-cover" />
          </div>
          <div className="w-[60%]">
            <div className="text-[25px] font-[600] text-center mb-[20px]">Getting Started 🔥</div>
            <div className="flex justify-between items-center mb-[30px]">
              <div className="w-[150px] h-auto overflow-hidden">
                <img src="/logo.jpg" className="w-full h-full object-cover"/>
              </div>
              <Link href="/" className="flex gap-[5px] items-center hover:text-[#0040ff]">
                <IoChevronBack className="w-[14px]" />
                <div className="text-[14px] font-[500] ">Return home</div>
              </Link>
            </div>
            <RegisterForm/>
            <div className="flex items-center gap-[5px] justify-center">
              <div className="text-[14px] font-[500]">Already have an account?</div>
              <Link href="/account/login" className="text-[14px] font-[500] text-[#505050] hover:text-[#0040ff]">Login</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
