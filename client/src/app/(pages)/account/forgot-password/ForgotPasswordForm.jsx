"use client"

import JustValidate from 'just-validate';
import { useEffect } from "react";
import Swal from 'sweetalert2'
import { useRouter } from "next/navigation";

export const ForgotPasswordForm = () => {
  const router = useRouter();
  useEffect(() => {
    const validation = new JustValidate('#forgot-password-form');

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
      .onSuccess((event) => {
        event.preventDefault();
        const email = event.target.email.value;

        const finalData = {
          email: email
        };

        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/account/forgot-password`, {
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
            if (data.code == "success") router.push(`/account/otp-password?email=${email}`);
            else {
              submitBtn.disabled = false;
              submitBtn.innerText = 'Send OTP';
            }
          })
      })
  }, [])

  return (
    <>
      <form className="mb-[15px]" id="forgot-password-form">
        <div className='mb-[30px] sm:mb-[50px]'>
          <label htmlFor="email" className="block mb-[8px] sm:mb-[15px] text-[14px] sm:text-[16px] text-[#505050] font-bold">EMAIL <span className="text-[red]">*</span></label>
          <input
            type="email"
            id="email"
            placeholder="What's your email"
            className="w-full h-full outline-none text-[#505050] text-[12px] sm:text-[14px] font-[400] border-b-[1px] border-b-[#ddd] pb-[10px]"
          />
        </div>
        <div className="w-full px-0 sm:px-[80px]">
          <button
            id="submit-btn"
            type="submit"
            className="p-[10px] bg-[#0078a6] hover:bg-[#0077a6d1] rounded-[8px] text-[14px] font-[600] text-white w-full cursor-pointer"
          >
            Send OTP
          </button>
        </div>
      </form>
    </>
  );
}