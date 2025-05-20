"use client"

import { TbPasswordFingerprint } from "react-icons/tb";
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
          errorMessage: 'Email required!'
        },
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
        <div className="border-[1px] border-[#dddd] rounded-[8px] p-[10px] flex gap-[20px] items-center shadow-lg mb-[30px]">
          <label htmlFor="otp">
            <TbPasswordFingerprint className="text-[18px]" />
          </label>
          <input
            type="text"
            id="otp"
            placeholder="OTP Password"
            className="flex-1 w-full h-full border-none outline-none text-[#505050] text-[14px] font-[400]"
          />
        </div>
        <button
          id="submit-btn"
          type="submit"
          className="p-[10px] bg-[black] hover:bg-[#000000ae] rounded-[8px] text-[14px] font-[600] text-white w-full cursor-pointer"
        >
          Verify OTP
        </button>
      </form>
    </>
  );
}