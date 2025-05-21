import Link from "next/link";

export const Section1 = () => {
  return (
    <>
      <div className="flex items-center gap-[50px]">
        <div className="w-[60%]">
          <div className="text-[40px] font-[600] text-[#505050] mb-[10px]" data-aos="fade-up">Smart IoT Solutions for a Smarter Future</div>
          <div className="text-[18px] font-[300] text-[#505050] mb-[30px]" data-aos="fade-up" data-aos-delay="150">From sensors to dashboards — everything you need to connect, monitor, and scale your IoT ecosystem, with real-time insights, seamless integration, and full control at every level of your operation</div>
          <div className="flex gap-[20px] items-center" data-aos="fade-up" data-aos-delay="300">
            <Link href="#" className="bg-[#505050] hover:bg-[#505050bd] text-white px-[20px] py-[10px] rounded-[8px] text-[20px] font-[600]">Getting Started</Link>
            <Link href="#" className="text-[20px] font-[600] text-[#505050] hover:bg-[#5e5e5e33] px-[20px] py-[10px] rounded-[8px]">Learn About IoT</Link>
          </div>
        </div>
        <div className="w-[650px] h-auto overflow-hidden rounded-[10px]" data-aos="fade-up">
          <img src="/homePic.png" className="w-full h-full object-cover" />
        </div>
      </div>
    </>
  );
}