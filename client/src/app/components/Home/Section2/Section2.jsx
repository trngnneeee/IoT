"use client"

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export const Section2 = () => {
  const dataSection2 = [
    {
      title: "Smart Homes",
      image: "/smartHome.jpg"
    },
    {
      title: "Wearable Technology",
      image: "/loginAvt.jpg"
    },
    {
      title: "Remote Monitoring",
      image: "/remoteMonitoring.jpg"
    },
    {
      title: "Energy Management",
      image: "/energy.jpg"
    },
  ]
  
  return (
    <>
      <div className='mt-[100px] sm:mt-[200px] lg:mt-[350px] mb-[30px] lg:mb-[50px]'>
        <div className='mb-[10px] sm:mb-[50px]'>
          <div className="text-[16px] sm:text-[30px] lg:text-[40px] font-[600] text-[#505050] mb-[10px]" data-aos="fade-up">Smarter Networks, Smarter Decisions</div>
          <div className="text-[10px] sm:text-[16px] lg:text-[18px] font-[300] text-[#505050] mb-[30px]" data-aos="fade-up" data-aos-delay="150">From sensors to dashboards — everything you need to connect, monitor, and scale your IoT ecosystem, with real-time insights, seamless integration, and full control at every level of your operation</div>
        </div>
        <div data-aos="fade-up">
          <Swiper
          modules={[Autoplay]}
            slidesPerView={3}
            loop={true}
            autoplay={{ delay: 2000, disableOnInteraction: true }}
            breakpoints={{
                500: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
                320: {
                  slidesPerView: 1,
                  spaceBetween: 20,
                }
              }}
          >
            {dataSection2.map((item, index) => (
              <SwiperSlide key={index}>
                <div className="relative w-[(100% - 40px)/3] h-[auto] overflow-hidden rounded-[20px]">
                  <img src={item.image} className="w-full h-auto object-cover" />
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white text-[15px] lg:text-[23px] xl:text-[32px] font-bold bg-black/40">
                    {item.title}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </>
  );
}