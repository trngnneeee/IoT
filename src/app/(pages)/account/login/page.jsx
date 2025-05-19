import Link from "next/link";
import { IoChevronBack } from "react-icons/io5";
import { GoMail } from "react-icons/go";
import { CiLock } from "react-icons/ci";

export const metadata = {
  title: "Đăng nhập"
};

export default function Home() {
  return (
    <>
      <div className="bg-[#F3F4F6] w-full h-full absolute">
        <div className="bg-white w-[1000px] h-auto mx-auto mt-[100px] p-[40px] flex gap-[40px] rounded-[20px] shadow-xl">
          <div className="w-[400px] h-[500px] rounded-[20px] overflow-hidden shadow-xl">
            <img src="/loginAvt.jpg" className="w-full h-full object-cover" />
          </div>
          <div className="w-[60%]">
            <div className="text-[30px] font-[500] text-center mb-[20px]">Welcome back 👋</div>
            <div className="flex justify-between items-center mb-[30px]">
              <div className="text-[24px] font-[700]">Logo</div>
              <Link href="/" className="flex gap-[5px] items-center hover:text-[#505050]">
                <IoChevronBack className="w-[14px]" />
                <div className="text-[14px] font-[500]">Return home</div>
              </Link>
            </div>
            <form className="mb-[15px]">
              <div className="border-[1px] border-[#dddd] rounded-[8px] p-[20px] flex gap-[20px] items-center shadow-lg mb-[30px]">
                <label htmlFor="email">
                  <GoMail className="text-[20px]" />
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="example@gmail.com"
                  className="flex-1 w-full h-full border-none outline-none text-[#505050] text-[20px] font-[400]"
                />
              </div>
              <div className="border-[1px] border-[#dddd] rounded-[8px] p-[20px] flex gap-[20px] items-center shadow-lg mb-[15px]">
                <label htmlFor="password">
                  <CiLock className="text-[24px]" />
                </label>
                <input
                  type="password"
                  id="password"
                  className="flex-1 w-full h-full border-none outline-none text-[20px] font-[400]"
                />
              </div>
              <div className="flex justify-between items-center mb-[30px]">
                <div className="flex items-center gap-[10px]">
                  <input
                    type="checkbox"
                    className="w-[20px] h-[20px]"
                  />
                  <label className="text-[14px] font-[500] text-[#505050]">Remember Password</label>
                </div>
                <Link href="/">
                  <div className="text-[14px] font-[500] text-[#505050] hover:text-[#0040ff]">Forgot Password</div>
                </Link>
              </div>
              <button className="p-[20px] bg-[black] hover:bg-[#000000ae] rounded-[8px] text-[20px] font-[500] text-white w-full cursor-pointer">Login</button>
            </form>
            <div className="flex items-center gap-[5px] justify-center">
              <div className="text-[14px] font-[500]">Don't have an account?</div>
              <Link href="/" className="text-[14px] font-[500] text-[#505050] hover:text-[#0040ff]">Register</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
