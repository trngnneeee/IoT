"use client"

import Swal from 'sweetalert2'
import JustValidate from 'just-validate';
import { useEffect } from "react";
import { useRouter } from 'next/navigation';

export const RegisterForm = () => {
  const router = useRouter();
  useEffect(() => {
    const form = document.getElementById('register-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
    });

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
            else {
              submitBtn.disabled = false;
              submitBtn.innerText = 'Register';
            }
          })
      })
  }, [])

  return (
    <>
      <form className="mb-[15px]" id="register-form">
        <div className='mb-[30px]'>
          <label htmlFor="name" className="block mb-[8px] sm:mb-[15px] text-[14px] sm:text-[16px] text-[#505050] font-bold">FULL NAME <span className="text-[red]">*</span></label>
          <input
            type="text"
            id="name"
            placeholder="What's your full name"
            className="w-full h-full outline-none text-[#505050] text-[12px] sm:text-[14px] font-[400] border-b-[1px] border-b-[#ddd] pb-[10px]"
          />
        </div>
        <div className='mb-[30px]'>
          <label htmlFor="email" className="block mb-[8px] sm:mb-[15px] text-[14px] sm:text-[16px] text-[#505050] font-bold">EMAIL <span className="text-[red]">*</span></label>
          <input
            type="email"
            id="email"
            placeholder="What's your email"
            className="w-full h-full outline-none text-[#505050] text-[12px] sm:text-[14px] font-[400] border-b-[1px] border-b-[#ddd] pb-[10px]"
          />
        </div>
        <div className='mb-[30px]'>
          <label htmlFor="password" className="block mb-[8px] sm:mb-[15px] text-[14px] sm:text-[16px] text-[#505050] font-bold">PASSWORD <span className="text-[red]">*</span></label>
          <input
            type="password"
            id="password"
            placeholder="What's your password"
            className="w-full h-full outline-none text-[#505050] text-[12px] sm:text-[14px] font-[400] border-b-[1px] border-b-[#ddd] pb-[10px]"
          />
        </div>
        <div className='mb-[30px]'>
          <label htmlFor="confirm-password" className="block mb-[8px] sm:mb-[15px] text-[14px] sm:text-[16px] text-[#505050] font-bold">CONFIRM PASSWORD <span className="text-[red]">*</span></label>
          <input
            type="password"
            id="confirm-password"
            placeholder="What's your password"
            className="w-full h-full outline-none text-[#505050] text-[12px] sm:text-[14px] font-[400] border-b-[1px] border-b-[#ddd] pb-[10px]"
          />
        </div>
        <div className="w-full px-0 sm:px-[80px]">
          <button
            id="submit-btn"
            type="submit"
            className="p-[10px] bg-[#0078a6] hover:bg-[#0077a6d1] rounded-[8px] text-[14px] font-[600] text-white w-full cursor-pointer"
          >
            Register
          </button>
        </div>
      </form>
    </>
  );
}