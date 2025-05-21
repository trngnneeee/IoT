"use client"

import Link from "next/link";
import { useEffect, useState } from "react";

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleRolled = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleRolled);
    return () => window.removeEventListener("scroll", handleRolled);
  })
  
  return (
    <>
      <div className={`flex justify-between px-[30px] py-[30px] bg-white sticky top-0 transition-shadow duration-300 z-50 rounded-b-[20px] ${
        scrolled ? "shadow-xl" : ""
      }`}>
        <div className="flex items-center gap-[20px]">
          <Link href="/" className="w-[120px] h-auto">
            <img className="w-full h-full object-cover" src="/logo.jpg" />
          </Link>
          <Link href="#" className="text-[16px] font-[600] text-[#505050] hover:bg-[#5e5e5e33] px-[20px] py-[3px] rounded-[8px]">Product</Link>
          <Link href="#" className="text-[16px] font-[600] text-[#505050] hover:bg-[#5e5e5e33] px-[20px] py-[3px] rounded-[8px]">Team</Link>
        </div>
        <div className="flex items-center gap-[20px]">
          <Link href="/account/login" className="text-[16px] font-[600] text-[#505050] hover:bg-[#5e5e5e33] px-[20px] py-[3px] rounded-[8px]">Login</Link>
          <Link href="/account/register" className="text-[16px] font-[600] text-[white] bg-[#505050] hover:bg-[#505050bd] px-[20px] py-[3px] rounded-[8px]">Register</Link>
        </div>
      </div>
    </>
  );
}