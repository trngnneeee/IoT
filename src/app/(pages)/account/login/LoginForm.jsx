"use client"

import Link from "next/link";
import { GoMail } from "react-icons/go";
import { CiLock } from "react-icons/ci";
import JustValidate from 'just-validate';
import { useEffect } from "react";

export const LoginForm = () => {
  useEffect(() => {
    const validation = new JustValidate('#login-form');

    validation
      .addField('#email', [
        {
          rule: 'required',
          errorMessage: 'Email required!'
        },
        {
          rule: 'email',
          errorMessage: 'Invalid email format!',
        },
      ])
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
        },
      ])
      .onSuccess((event) => {
        const email = event.target.email.value;
        const password = event.target.password.value;

        console.log(email);
        console.log(password);
      })
  }, [])

  return (
    <>
      <form className="mb-[15px]" id="login-form">
        <div className="border-[1px] border-[#dddd] rounded-[8px] p-[10px] flex gap-[20px] items-center shadow-lg mb-[30px]">
          <label htmlFor="email">
            <GoMail className="text-[18px]" />
          </label>
          <input
            type="email"
            id="email"
            placeholder="Email"
            className="flex-1 w-full h-full border-none outline-none text-[#505050] text-[14px] font-[400]"
          />
        </div>
        <div className="border-[1px] border-[#dddd] rounded-[8px] p-[10px] flex gap-[20px] items-center shadow-lg mb-[20px]">
          <label htmlFor="password">
            <CiLock className="text-[18px]" />
          </label>
          <input
            type="password"
            id="password"
            placeholder="Password"
            className="flex-1 w-full h-full border-none outline-none text-[#505050] text-[14px] font-[400]"
          />
        </div>
        <div className="flex justify-between items-center mb-[20px]">
          <div className="flex items-center gap-[10px]">
            <input
              type="checkbox"
              className="w-[20px] h-[20px]"
            />
            <label className="text-[14px] font-[500] text-[#505050]">Remember Password</label>
          </div>
          <Link href="/account/forgot-password">
            <div className="text-[14px] font-[500] text-[#505050] hover:text-[#0040ff]">Forgot Password</div>
          </Link>
        </div>
        <button className="p-[10px] bg-[black] hover:bg-[#000000ae] rounded-[8px] text-[14px] font-[600] text-white w-full cursor-pointer">Login</button>
      </form>
    </>
  );
}