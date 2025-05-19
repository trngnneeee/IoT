import Link from "next/link";
import { IoChevronBack } from "react-icons/io5";
import { GoMail } from "react-icons/go";

export const metadata = {
  title: "Forgot Password"
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
            <div className="text-[25px] font-[600] text-center mb-[20px]">Forgot Password 🔍</div>
            <div className="flex justify-between items-center mb-[30px]">
              <div className="w-[150px] h-auto overflow-hidden">
                <img src="/logo.jpg" className="w-full h-full object-cover"/>
              </div>
              <Link href="/" className="flex gap-[5px] items-center hover:text-[#0040ff]">
                <IoChevronBack className="w-[14px]" />
                <div className="text-[14px] font-[500]">Return home</div>
              </Link>
            </div>
            <form className="mb-[15px]">
              <div className="border-[1px] border-[#dddd] rounded-[8px] p-[10px] flex gap-[20px] items-center shadow-lg mb-[30px]">
                <label htmlFor="email">
                  <GoMail className="text-[18px]" />
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  className="flex-1 w-full h-full border-none outline-none text-[#505050] text-[14px] font-[400]"
                />
              </div>
              <button className="p-[10px] bg-[black] hover:bg-[#000000ae] rounded-[8px] text-[14px] font-[600] text-white w-full cursor-pointer">Send OTP</button>
            </form>
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
