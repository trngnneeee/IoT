"use client"

import Swal from 'sweetalert2'
import JustValidate from 'just-validate';
import { useEffect } from "react";
import { GoMail } from "react-icons/go";
import { CiLock } from "react-icons/ci";
import { LuUserRound } from "react-icons/lu";
import { useRouter } from 'next/navigation';

export const RegisterForm = () => {
  const router = useRouter();
  useEffect(() => {
    const validation = new JustValidate('#register-form');

    validation
      .addField('#name', [
        {
          rule: 'required',
          errorMessage: 'Name required!'
        },
      ])
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

        const fullName = event.target.name.value;
        const email = event.target.email.value;
        const password = event.target.password.value;

        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Sending...';

        const finalData = {
          fullName: fullName,
          email: email,
          password: password
        };

        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/account/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(finalData)
        })
          .then(res => res.json())
          .then(data => {
            Swal.fire({
              icon: data.code,
              title: data.message,
              timer: 3000
            });
            if (data.code == "success") router.push("/account/register-initial");
            else
            {
              submitBtn.disabled = false;
              submitBtn.innerText = 'Register';
            }
          })
      })
  }, [])

  return (
    <>
      <form className="mb-[15px]" id='register-form'>
        <div className="border-[1px] border-[#dddd] rounded-[8px] p-[10px] flex gap-[20px] items-center shadow-lg mb-[20px]">
          <label htmlFor="name">
            <LuUserRound className="text-[18px]" />
          </label>
          <input
            type="text"
            id="name"
            placeholder="Full Name"
            className="flex-1 w-full h-full border-none outline-none text-[#505050] text-[14px] font-[400]"
          />
        </div>
        <div className="border-[1px] border-[#dddd] rounded-[8px] p-[10px] flex gap-[20px] items-center shadow-lg mb-[20px]">
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
          Register
        </button>
      </form>
    </>
  );
}