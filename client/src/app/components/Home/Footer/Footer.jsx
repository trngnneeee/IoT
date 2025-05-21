import Link from "next/link";

export const Footer = () => {
  return (
    <>
      <div className="px-[100px] py-[30px] flex items-center justify-between bg-white rounded-[50px]">
        <div className="w-[800px]">
          <div className="w-[150px] h-auto mb-[15px]">
            <img src="/logo.jpg" className="w-full h-full object-cover" />
          </div>
          <div className="text-[14px] font-[300] text-[#505050] mb-[10px]">This website is a student project developed as part of the Physics for Information Technology course. It is intended for educational purposes only and not for commercial use. This open source can be found at <a href="https://github.com/trngnneeee/IoT-Web" target="blank" className="text-[14px] font-[600] underline">IoT Website</a></div>
        </div>
        <div>
          <Link href="#" className="text-[16px] font-[600] text-[#505050] px-[20px] py-[3px] rounded-[8px]">Product</Link>
          <Link href="#" className="text-[16px] font-[600] text-[#505050] px-[20px] py-[3px] rounded-[8px]">Team</Link>
        </div>
      </div>
    </>
  );
}