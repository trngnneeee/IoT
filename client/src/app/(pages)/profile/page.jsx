"use client"

import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import JustValidate from 'just-validate';
import Swal from 'sweetalert2'

export default function ProfilePage() {
  const { isLogin, infoUser, isLoading } = useAuth();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!infoUser) return;

    const validation = new JustValidate('#reset-password-form');

    validation
      .addField('#password', [
        {
          rule: 'required',
          errorMessage: 'Password required!',
        },
        {
          validator: (value) => value.length >= 8,
          errorMessage: 'Password must contain at least 8 characters!',
        },
        {
          validator: (value) => /[A-Z]/.test(value),
          errorMessage: 'Password must contain at least one uppercase letter!',
        },
        {
          validator: (value) => /[a-z]/.test(value),
          errorMessage: 'Password must contain at least one lowercase letter!',
        },
        {
          validator: (value) => /\d/.test(value),
          errorMessage: 'Password must contain at least one digit!',
        },
        {
          validator: (value) => /[@$!%*?&]/.test(value),
          errorMessage: 'Password must contain at least one special character!',
        }
      ])
      .onSuccess(() => {
        setIsValid(true);
      })
  }, [infoUser])

  const handleResetPassword = (event) => {
    if (!isValid) return;
    
    console.log("Reset password clicked");
    const password = event.target.password.value;
    const finalData = {
      password: password
    }
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/account/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(finalData)
    })
      .then(res => res.json())
      .then(data => {
        Swal.fire({
          icon: data.code,
          title: data.message,
          timer: 3000
        });
      })
  }

  return (
    <>
      <div className="ml-[350px] pt-[50px] mr-[50px]">
        <div className="text-[36px] font-semibold mb-[30px]" data-aos="fade-up">Profile</div>
        <form id="reset-password-form" onSubmit={(event) => handleResetPassword(event)} data-aos="fade-up" data-aos-delay="200">
          <div className="flex flex-col gap-[10px] mb-[30px]">
            <label htmlFor="fullName" className="text-gray-500 text-[12px]">Full name</label>
            <input id="fullName" className="border-b border-[#ddd] outline-none" defaultValue={infoUser && infoUser.fullName} />
          </div>
          <div className="flex flex-col gap-[10px] mb-[30px]">
            <label htmlFor="email" className="text-gray-500 text-[12px]">Email</label>
            <input type="email" id="email" className="border-b border-[#ddd] outline-none" defaultValue={infoUser && infoUser.email} readOnly />
          </div>
          <div className="flex flex-col gap-[10px]">
            <label htmlFor="password" className="text-gray-500 text-[12px]">Password</label>
            <input type="text" id="password" className="border-b border-[#ddd] outline-none" />
          </div>
          <div className="mt-[30px]">
            <button className="bg-gray-800 hover:bg-gray-500 px-[40px] py-[10px] text-white font-semibold rounded-[20px]">Reset password</button>
          </div>
        </form>
      </div>
    </>
  );
}