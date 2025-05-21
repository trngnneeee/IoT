"use client"

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export const Section2 = () => {
  return (
    <>
      <div className='mt-[350px] mb-[50px]'>
        <div className='mb-[50px]'>
          <div className="text-[40px] font-[600] text-[#505050] mb-[10px]" data-aos="fade-up">Smarter Networks, Smarter Decisions</div>
          <div className="text-[18px] font-[300] text-[#505050] mb-[30px]" data-aos="fade-up" data-aos-delay="150">Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi consequatur ducimus ratione iusto nihil. Qui, reiciendis blanditiis consequuntur aut magnam a veritatis asperiores sequi distinctio soluta aperiam officiis nam assumenda.</div>
        </div>
        <div data-aos="fade-up">
          <Swiper
          modules={[Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={3}
            loop={true}
            autoplay={{ delay: 2000, disableOnInteraction: true }}
            pagination={{ clickable: true }}
          >
            <SwiperSlide>
              <div className="relative w-[400px] h-[auto] overflow-hidden rounded-[20px]">
                <img src="/smartHome.jpg" className="w-full h-auto object-cover" />
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white text-[32px] font-bold bg-black/40">
                  Smart Homes
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="relative w-[400px] h-auto overflow-hidden rounded-[20px]">
                <img src="/loginAvt.jpg" className="w-full h-auto object-cover" />
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white text-[32px] font-bold bg-black/40">
                  Wearable Technology
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="relative w-[400px] h-[265px] overflow-hidden rounded-[20px]">
                <div>
                  <img src="/remoteMonitoring.jpg" className="w-full h-auto object-cover" />
                </div>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white text-[32px] font-bold bg-black/40">
                  Remote Monitoring
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="relative w-[400px] h-auto overflow-hidden rounded-[20px]">
                <img src="/energy.jpg" className="w-full h-auto object-cover" />
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white text-[32px] font-bold bg-black/40">
                  Energy Management
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </>
  );
}