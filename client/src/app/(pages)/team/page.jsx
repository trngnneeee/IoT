"use client"

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { FaLocationDot } from "react-icons/fa6";
import { FaFacebook } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { BiLogoInstagramAlt } from "react-icons/bi";
import { MdOutlineEmail } from "react-icons/md";
import Link from 'next/link';

export default function Team() {
  const data = [
    {
      image: "/dk.jpg",
      name: "Dang Dang Khoa",
      studentID: "23127207",
      location: "TP HCM",
      email: "ddkhoa23@clc.fitus.edu.vn",
      facebook: "https://www.facebook.com/dangw.khoa.2701/",
      github: "https://github.com/khoavadienq",
      instagram: "https://www.instagram.com/ppg4j_dk"
    },
    {
      image: "/qd.jpg",
      name: "Nguyen Tran Quoc Duy",
      studentID: "23127181",
      location: "TP HCM",
      email: "ntqduy23@clc.fitus.edu.vn",
      facebook: "https://www.facebook.com/trngn.neee",
      github: "https://github.com/trngnneeee",
      instagram: "https://www.instagram.com/trngn.neee"
    },
    {
      image: "/tn.jpg",
      name: "Dang Truong Nguyen",
      studentID: "23127438",
      location: "TP HCM",
      email: "dtnguyen23@clc.fitus.edu.vn",
      facebook: "https://www.facebook.com/trngn.neee",
      github: "https://github.com/trngnneeee",
      instagram: "https://www.instagram.com/trngn.neee"
    },
  ]

  return (
    <>
      <div className="my-[20px] sm:my-[40px]">
        <div className="text-[40px] sm:text-[50px] font-extrabold text-[#505050] text-center mb-[30px]" data-aos="fade-up">Our Team</div>
        <div className='px-[30px] sm:px-[80px] md:px-[200px] xl:px-[300px]' data-aos="fade-up" data-aos-delay="200">
          <Swiper
            modules={[Autoplay]}
            slidesPerView={1}
            spaceBetween={30}
            loop={true}
            autoplay={{ delay: 4000, disableOnInteraction: true }}
            className='w-full lg:w-[60%]'
          >
            {data.map((item, index) => (
              <SwiperSlide key={index}>
                <div className='flex flex-col items-center relative mt-[75px] sm:mt-[125px] cursor-pointer'>
                  <div className='rounded-[50%] overflow-hidden w-[150px] sm:w-[200px] xl:w-[250px] h-[150px] sm:h-[200px] xl:h-[250px] border-[#ddd] border-[5px] absolute top-[-75px] sm:top-[-100px] xl:top-[-125px]'>
                    <img src={item.image} className='w-full h-full object-cover' />
                  </div>
                  <div className='bg-white px-[50px] w-full pt-[90px] sm:pt-[125px] xl:pt-[145px] pb-[50px] rounded-[20px] flex flex-col items-center'>
                    <div className='text-[18px] sm:text-[24px] font-bold text-[#505050]'>{item.name}</div>
                    <div className='text-[16px] sm:text-[20px] font-bold text-[#505050]'>{item.studentID}</div>
                    <div className='flex items-center gap-[5px] text-[12px] sm:text-[16px] text-[#505050] mt-[10px] sm:mt-[20px]'>
                      <FaLocationDot />
                      <div>{item.location}</div>
                    </div>
                    <div className='flex gap-[20px] mt-[15px] sm:mt-[30px]'>
                      <Link href={item.facebook} className='hover:text-[#4880FF]'><FaFacebook className='text-[20px] sm:text-[24px]' /></Link>
                      <Link href={item.instagram} className='hover:text-[#4880FF]'><BiLogoInstagramAlt className='text-[20px] sm:text-[24px]' /></Link>
                      <Link href={item.github} className='hover:text-[#4880FF]'><FaGithub className='text-[20px] sm:text-[24px]' /></Link>
                    </div>
                    <div className='text-[12px] sm:text-[16px] text-[#505050] mt-[20px] flex items-center gap-[5px]'>
                      <MdOutlineEmail className='text-[20px]' />
                      <div className='text-[10px] sm:text-[14px] font-bold'>
                        {item.email}
                      </div>
                    </div>
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