"use client"

import Link from "next/link";
import { RiDashboard2Line } from "react-icons/ri";
import { IoMdSettings } from "react-icons/io";
import { usePathname, useRouter } from "next/navigation";
import { IoPowerSharp } from "react-icons/io5";
import { AiOutlineHome } from "react-icons/ai";
import Swal from "sweetalert2"

export const Sider = () => {
  const pathName = usePathname();
  const router = useRouter();

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
      <div className="bg-white w-[300px] h-full fixed t-0 shadow-2xl" data-aos="fade-right">
        <div className="w-full h-auto px-[50px] mt-[20px] mb-[50px] cursor-pointer" onClick={() => { router.push("/") }}>
          <img src="/logo.jpg" className="w-full h-full object-cover" />
        </div>
        <div className="border-b-[#ddd] border-b-[1px] w-full pb-[20px]">
          <Link href="/" className="flex items-center gap-[20px] hover:bg-[#4880FF] hover:text-white px-[15px] py-[10px] rounded-[8px] mb-[10px] mx-[20px]">
            <AiOutlineHome className="text-[25px]" />
            <div className="text-[18px] font-medium">Home</div>
          </Link>
          <Link href="/dashboard" className={"flex items-center gap-[20px] hover:bg-[#4880FF] hover:text-white px-[15px] py-[10px] rounded-[8px] mb-[10px] mx-[20px] " + (pathName.startsWith("/dashboard") ? 'bg-[#4880FF] text-white' : '')}>
            <RiDashboard2Line className="text-[25px]" />
            <div className="text-[18px] font-medium">Dashboard</div>
          </Link>
          <Link href="/control" className={"flex items-center gap-[20px] hover:bg-[#4880FF] hover:text-white px-[15px] py-[10px] rounded-[8px] mx-[20px] " + (pathName.startsWith("/control") ? 'bg-[#4880FF] text-white' : '')}>
            <IoMdSettings className="text-[25px]" />
            <div className="text-[18px] font-medium">Control</div>
          </Link>
        </div>
        <div className="mt-[20px]">
          <Link href="#" className="flex items-center gap-[20px] text-[#F93C65] px-[15px] py-[10px] rounded-[8px] mx-[20px]" onClick={handleLogout}>
            <IoPowerSharp className="text-[25px]" />
            <div className="text-[18px] font-medium">Logout</div>
          </Link>
        </div>
      </div>
    </>
  );
}