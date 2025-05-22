"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import { CiCircleList } from "react-icons/ci";

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleRolled = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleRolled);
    return () => window.removeEventListener("scroll", handleRolled);
  })

  const handleOpenMenu = () => {
    console.log("ok");
  }
  
  return (
    <>
      <div className={`flex justify-between items-center px-[30px] py-[20px] lg:py-[30px] bg-white sticky top-0 transition-shadow duration-300 z-50 rounded-b-[20px] ${
        scrolled ? "shadow-xl" : ""
      }`}>
        <div className="block sm:hidden cursor-pointer" onClick={handleOpenMenu}>
          <CiCircleList className="text-[15px]" />
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