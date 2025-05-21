"use client"

import Link from "next/link";
import { GoMail } from "react-icons/go";
import { CiLock } from "react-icons/ci";
import JustValidate from 'just-validate';
import { useEffect } from "react";
import Swal from 'sweetalert2'
import { useRouter } from "next/navigation";

export const LoginForm = () => {
  const router = useRouter();
  useEffect(() => {
    const form = document.getElementById('login-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
    });
    
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
        event.preventDefault();
        const email = event.target.email.value;
        const password = event.target.password.value;
        const rememberPassword = event.target.rememberPassword.checked;

        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Sending...';

        const finalData = {
          email: email,
          password: password,
          rememberPassword: rememberPassword
        };

        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/account/login`, {
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
            if(data.code == "success") router.push("/");
            else
            {
              submitBtn.disabled = false;
              submitBtn.innerText = 'Login';
            }
          })
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
              id="rememberPassword"
            />
            <label className="text-[14px] font-[500] text-[#505050]" htmlFor="rememberPassword">Remember Password</label>
          </div>
          <Link href="/account/forgot-password">
            <div className="text-[14px] font-[500] text-[#505050] hover:text-[#0040ff]">Forgot Password</div>
          </Link>
        </div>
        <button 
          id="submit-btn"
          type="submit"
          className="p-[10px] bg-[black] hover:bg-[#000000ae] rounded-[8px] text-[14px] font-[600] text-white w-full cursor-pointer"
        >
          Login
        </button>
      </form>
    </>
  );
}