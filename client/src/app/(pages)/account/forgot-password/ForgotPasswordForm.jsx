"use client"

import { GoMail } from "react-icons/go";
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
        <button
          id="submit-btn"
          type="submit"
          className="p-[10px] bg-[black] hover:bg-[#000000ae] rounded-[8px] text-[14px] font-[600] text-white w-full cursor-pointer"
        >
          Send OTP
        </button>
      </form>
    </>
  );
}