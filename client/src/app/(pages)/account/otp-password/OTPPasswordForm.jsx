"use client"

import JustValidate from 'just-validate';
import { useEffect } from "react";
import Swal from 'sweetalert2'
import { useRouter, useSearchParams } from "next/navigation";

export const OTPPasswordForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    const validation = new JustValidate('#otp-password-form');

    validation
      .addField('#otp', [
        {
          rule: 'required',
          errorMessage: 'OTP required!'
        },
        {
          validator: (value) => /^\d{6}$/.test(value),
          errorMessage: 'OTP must be exactly 6 digits',
        }

      ])
      .onSuccess((event) => {
        event.preventDefault();
        const otp = event.target.otp.value;
        const email = searchParams.get("email");

        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Sending...';

        const finalData = {
          otp: otp,
          email: email
        };

        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/account/otp-password`, {
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
            if (data.code == "success") router.push("/account/reset-password");
            else {
              submitBtn.disabled = false;
              submitBtn.innerText = 'Verify OTP';
            }
          })
      })
  }, [])

  return (
    <>
      <form className="mb-[15px]" id="otp-password-form">
        <div className='mb-[50px]'>
          <label htmlFor="otp" className="block mb-[15px] text-[16px] text-[#505050] font-bold">OTP <span className="text-[red]">*</span></label>
          <input
            type="text"
            id="otp"
            placeholder="What's your OTP"
            className="w-full h-full outline-none text-[#505050] text-[14px] font-[400] border-b-[1px] border-b-[#ddd] pb-[10px]"
          />
        </div>
        <div className="w-full px-[80px]">
          <button
            id="submit-btn"
            type="submit"
            className="p-[10px] bg-[#0078a6] hover:bg-[#0077a6d1] rounded-[8px] text-[14px] font-[600] text-white w-full cursor-pointer"
          >
            Verify OTP
          </button>
        </div>
      </form>
    </>
  );
}