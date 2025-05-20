"use client"

import { CiLock } from "react-icons/ci";
import Swal from 'sweetalert2'
import JustValidate from 'just-validate';
import { useEffect } from "react";

export const ResetPasswordForm = () => {
  useEffect(() => {
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
      .addField('#confirm-password', [
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
        {
          validator: (value, fields) => {
            const password = fields['#password'].elem.value;
            return value == password;
          },
          errorMessage: 'Password does not match!',
        }
      ])
      .onSuccess((event) => {
        event.preventDefault();

        const password = event.target.password.value;

        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Sending...';

        const finalData = {
          password: password
        };

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
            if (data.code == "success") router.push("/");
            else {
              submitBtn.disabled = false;
              submitBtn.innerText = 'Register';
              router.push("/account/login");
            }
          })
      })
  }, [])

  return (
    <>
      <form className="mb-[15px]" id="reset-password-form">
        <div className="border-[1px] border-[#dddd] rounded-[8px] p-[10px] flex gap-[20px] items-center shadow-lg mb-[20px]">
          <label htmlFor="password">
            <CiLock className="text-[20px]" />
          </label>
          <input
            type="password"
            id="password"
            placeholder="Password"
            className="flex-1 w-full h-full border-none outline-none text-[#505050] text-[14px] font-[400]"
          />
        </div>
        <div className="border-[1px] border-[#dddd] rounded-[8px] p-[10px] flex gap-[20px] items-center shadow-lg mb-[20px]">
          <label htmlFor="confirm-password">
            <CiLock className="text-[20px]" />
          </label>
          <input
            type="password"
            id="confirm-password"
            placeholder="Confirm Password"
            className="flex-1 w-full h-full border-none outline-none text-[#505050] text-[14px] font-[400]"
          />
        </div>
        <button 
          id="submit-btn"
          type="submit"
          className="p-[10px] bg-[black] hover:bg-[#000000ae] rounded-[8px] text-[14px] font-[600] text-white w-full cursor-pointer"
        >
          Reset Password
        </button>
      </form>
    </>
  );
}