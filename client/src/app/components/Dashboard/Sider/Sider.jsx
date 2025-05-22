import Link from "next/link";
import { RiDashboard2Line } from "react-icons/ri";
import { IoMdSettings } from "react-icons/io";

export const Sider = () => {
  return (
    <>
      <div className="bg-white w-[200px] h-full fixed t-0">
        <div className="border-b-[#ddd] border-b-[1px] w-full pb-[20px]">
          <Link href="/dashboard" className="flex items-center gap-[8px] hover:bg-[#5e5e5e33] px-[20px] py-[10px] rounded-[8px] mb-[10px] m-[20px]">
            <RiDashboard2Line className="text-[25px]" />
            <div className="text-[16px] font-[600]">Dashboard</div>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-[8px] hover:bg-[#5e5e5e33] px-[20px] py-[10px] rounded-[8px] mb-[10px] m-[20px]">
            <RiDashboard2Line className="text-[25px]" />
            <div className="text-[16px] font-[600]">Dashboard</div>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-[8px] hover:bg-[#5e5e5e33] px-[20px] py-[10px] rounded-[8px] mb-[10px] m-[20px]">
            <RiDashboard2Line className="text-[25px]" />
            <div className="text-[16px] font-[600]">Dashboard</div>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-[8px] hover:bg-[#5e5e5e33] px-[20px] py-[10px] rounded-[8px] mb-[10px] m-[20px]">
            <RiDashboard2Line className="text-[25px]" />
            <div className="text-[16px] font-[600]">Dashboard</div>
          </Link>
        </div>
        <div className="mt-[20px]">
          <Link href="#" className="flex items-center gap-[15px] hover:bg-[#5e5e5e33] px-[20px] py-[10px] rounded-[8px] mb-[10px] m-[20px]">
            <IoMdSettings className="text-[25px]" />
            <div className="text-[16px] font-[600]">Setting</div>
          </Link>
          <button className="flex items-center gap-[15px] hover:bg-[#5e5e5e33] px-[20px] py-[10px] rounded-[8px] mb-[10px] m-[20px]">
            <IoMdSettings className="text-[25px]" />
            <div className="text-[16px] font-[600]">Setting</div>
          </button>
        </div>
      </div>
    </>
  );
}