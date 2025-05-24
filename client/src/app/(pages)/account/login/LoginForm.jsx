"use client"

import Link from "next/link";
import JustValidate from 'just-validate';
import { useEffect, useRef, useState } from "react";
import Swal from 'sweetalert2'
import { useRouter } from "next/navigation";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";

export const LoginForm = () => {
  const [viewPass, setViewPass] = useState(false);
  const passwordErrorContainerRef = useRef(null);
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
      ], {
        errorsContainer: passwordErrorContainerRef.current
      })
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
            if (data.code == "success") router.push("/dashboard");
            else {
              submitBtn.disabled = false;
              submitBtn.innerText = 'Login';
            }
          })
      })
  }, [])

  const handleViewPassword = (event) => {
    event.preventDefault();
    setViewPass(!viewPass);
  }

  return (
    <>
      <form className="mb-[15px]" id="login-form">
        <div className="mb-[30px]">
          <label htmlFor="email" className="block mb-[8px] sm:mb-[15px] text-[14px] sm:text-[16px] text-[#505050] font-bold">EMAIL <span className="text-[red]">*</span></label>
          <input
            type="email"
            id="email"
            placeholder="What's your email"
            className="w-full h-full outline-none text-[#505050] text-[12px] sm:text-[14px] font-[400] border-b-[1px] border-b-[#ddd] pb-[10px]"
          />
        </div>
        <div className="mb-[30px]">
          <label htmlFor="password" className="block mb-[8px] sm:mb-[15px] text-[14px] sm:text-[16px] text-[#505050] font-bold">PASSWORD <span className="text-[red]">*</span></label>
          <div className="flex items-center justify-between border-b-[1px] border-b-[#ddd] gap-[20px]">
            <input
              type={viewPass ? "text" : "password"}
              id="password"
              placeholder="What's your password"
              className="w-full h-full outline-none text-[#505050] text-[12px] sm:text-[14px] font-[400] pb-[10px] flex-1"
            />
            <div onClick={handleViewPassword} className="cursor-pointer">
              {!viewPass && (
                <FaRegEye className="text-[20px]" />
              )}
              {viewPass && (
                <FaRegEyeSlash className="text-[20px]" />
              )}
            </div>
          </div>
          <div ref={passwordErrorContainerRef}></div>
        </div>
        <div className="flex justify-between items-center mb-[20px] sm:mb-[40px]">
          <div className="flex items-center gap-[5px]">
            <input
              type="checkbox"
              className="w-[20px] h-[20px]"
              id="rememberPassword"
            />
            <label className="text-[10px] sm:text-[14px] font-[500] text-[#505050]" htmlFor="rememberPassword">Remember Password</label>
          </div>
          <Link href="/account/forgot-password">
            <div className="text-[10px] sm:text-[14px] font-[500] text-[#505050] hover:text-[#0040ff]">Forgot Password</div>
          </Link>
        </div>
        <div className="w-full px-0 sm:px-[80px]">
          <button
            id="submit-btn"
            type="submit"
            className="p-[10px] bg-[#0078a6] hover:bg-[#0077a6d1] rounded-[8px] text-[14px] font-[600] text-white w-full cursor-pointer"
          >
            Login
          </button>
        </div>
      </form>
    </>
  );
}