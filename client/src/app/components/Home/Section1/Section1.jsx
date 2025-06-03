"use client"

import Link from "next/link";
import { useAuth } from "../../../../hooks/useAuth";

export const Section1 = () => {
  const { isLogin, infoUser } = useAuth();
  
  return (
    <>
      <div className="flex items-center gap-[10px] sm:gap-[30px] lg:gap-[50px]">
        <div className="w-[60%]">
          <div className="text-[16px] sm:text-[30px] lg:text-[40px] font-[600] text-[#505050] mb-[10px]" data-aos="fade-up">Smart IoT Solutions for a Smarter Future</div>
          <div className="text-[10px] sm:text-[16px] lg:text-[18px] font-[300] text-[#505050] mb-[10px] sm:mb-[30px]" data-aos="fade-up" data-aos-delay="150">From sensors to dashboards — everything you need to connect, monitor, and scale your IoT ecosystem, with real-time insights, seamless integration, and full control at every level of your operation</div>
          <div className="flex gap-[10px] lg:gap-[20px] items-center" data-aos="fade-up" data-aos-delay="300">
            <Link href={isLogin ? "/dashboard" : "/account/login"} className="bg-[#505050] hover:bg-[#505050bd] text-white px-[10px] sm:px-[20px] py-[10px] rounded-[8px] text-[10px] lg:text-[20px] font-[600]" title={isLogin ? "Dashboard" : "Login"}>
              {isLogin ? "Dashboard" : "Getting Started"}
            </Link>
            <Link href="https://en.wikipedia.org/wiki/Internet_of_things" target="blank" title="Wikipedia-IoT" className="hidden sm:block text-[10px] lg:text-[20px] font-[600] text-[#505050] hover:bg-[#5e5e5e33] px-[20px] py-[10px] rounded-[8px]">About IoT</Link>
          </div>
        </div>
        <div className="w-[250px] sm:w-[400px] lg:w-[650px] h-auto overflow-hidden rounded-[10px]" data-aos="fade-up">
          <img src="/homePic.png" className="w-full h-full object-cover" />
        </div>
      </div>
    </>
  );
}