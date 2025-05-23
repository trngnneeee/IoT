"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HiViewList } from "react-icons/hi";
import Swal from 'sweetalert2'

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false)
  const [account, setAccount] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const handleRolled = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleRolled);
    return () => window.removeEventListener("scroll", handleRolled);
  })

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/verifyToken`, {
      method: "POST",
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.code == "error") {
          router.push("/account/login");
        }
        else {
          setAccount(data.account);
        }
      })
  }, []);

  const handleLogout = () => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/account/logout`, {
      method: "POST",
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        Swal.fire({
          icon: data.code,
          title: data.message,
          timer: 3000
        });
        if (data.code == "success") router.push("/account/login");
      })
  }

  return (
    <>
      {open && (
        <div className="w-[120px] h-dvh bg-[#e0f2f5] fixed z-100 py-[20px] px-[5px]">
          <div className="w-full h-auto px-[10px] mb-[30px]">
            <img src="logo.jpg" />
          </div>
          <div className="flex flex-col gap-[5px] border-b-[1px] border-b-[#cecbcb] pb-[20px]">
            <Link href="#" className="text-[10px] font-[600] text-[#505050] hover:bg-[#5e5e5e33] px-[10px] py-[3px] rounded-[8px]">Product</Link>
            <Link href="#" className="text-[10px] font-[600] text-[#505050] hover:bg-[#5e5e5e33] px-[10px] py-[3px] rounded-[8px]">Team</Link>
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
          {!account && (
            <Link href="/account/login" className="text-[10px] sm:text-[14px] lg:text-[16px] font-[600] text-[#505050] hover:bg-[#5e5e5e33] px-[10px] sm:px-[20px] py-[3px] rounded-[8px]">Login</Link>
          )}
          {!account && (
            <Link href="/account/register" className="text-[10px] sm:text-[14px] lg:text-[16px] font-[600] text-[white] bg-[#505050] hover:bg-[#505050bd] px-[10px] sm:px-[20px] py-[3px] rounded-[8px]">Register</Link>
          )}
          {account && (
            <Link href="/dashboard" className="text-[10px] sm:text-[14px] lg:text-[16px] font-[600] text-[white] bg-[#505050] hover:bg-[#505050bd] px-[10px] sm:px-[20px] py-[3px] rounded-[8px]">Dashboard</Link>
          )}
          {account && (
            <button className="text-[10px] sm:text-[14px] lg:text-[16px] font-[600] text-[#505050] hover:bg-[#5e5e5e33] px-[10px] sm:px-[20px] py-[3px] rounded-[8px] cursor-pointer" onClick={handleLogout}>Logout</button>
          )}
        </div>
      </div>
    </>
  );
}