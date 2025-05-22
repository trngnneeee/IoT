"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import { HiViewList } from "react-icons/hi";

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleRolled = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleRolled);
    return () => window.removeEventListener("scroll", handleRolled);
  })

  return (
    <>
      {open && (
        <div className="w-[120px] h-dvh bg-[#e0f2f5] fixed z-100 py-[20px] px-[5px]">
          <div className="flex flex-col gap-[5px] border-b-[1px] border-b-[#cecbcb] pb-[20px]">
            <Link href="#" className="text-[10px] font-[600] text-[#505050] hover:bg-[#5e5e5e33] px-[10px] py-[3px] rounded-[8px]">Product</Link>
            <Link href="#" className="text-[10px] font-[600] text-[#505050] hover:bg-[#5e5e5e33] px-[10px] py-[3px] rounded-[8px]">Team</Link>
          </div>
          <div>
            
          </div>
        </div>
      )}
      {open && (
        <div
          className="bg-[#00000053] w-full h-full fixed z-80 cursor-pointer"
          onClick={() => setOpen(false)}
        ></div>
      )}

      <div className={`flex justify-between items-center px-[30px] py-[20px] lg:py-[30px] bg-white sticky top-0 transition-shadow duration-300 z-50 rounded-b-[20px] ${scrolled ? "shadow-xl" : ""
        }`}>
        <div className="block sm:hidden cursor-pointer" onClick={() => { setOpen(true) }}>
          <HiViewList className="text-[15px]" />
        </div>
        <div className="flex items-center gap-[20px]">
          <Link href="/" className="w-[80px] sm:w-[100px] lg:w-[120px] h-auto">
            <img className="w-full h-full object-cover" src="/logo.jpg" />
          </Link>
          <Link href="#" className="hidden sm:block text-[14px] lg:text-[16px] font-[600] text-[#505050] hover:bg-[#5e5e5e33] px-[20px] py-[3px] rounded-[8px]">Product</Link>
          <Link href="#" className="hidden sm:block text-[14px] lg:text-[16px] font-[600] text-[#505050] hover:bg-[#5e5e5e33] px-[20px] py-[3px] rounded-[8px]">Team</Link>
        </div>
        <div className="flex items-center gap-[10px] sm:gap-[20px]">
          <Link href="/account/login" className="text-[10px] sm:text-[14px] lg:text-[16px] font-[600] text-[#505050] hover:bg-[#5e5e5e33] px-[10px] sm:px-[20px] py-[3px] rounded-[8px]">Login</Link>
          <Link href="/account/register" className="text-[10px] sm:text-[14px] lg:text-[16px] font-[600] text-[white] bg-[#505050] hover:bg-[#505050bd] px-[10px] sm:px-[20px] py-[3px] rounded-[8px]">Register</Link>
        </div>
      </div>
    </>
  );
}