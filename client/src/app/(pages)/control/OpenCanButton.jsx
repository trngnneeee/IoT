"use client"

import Swal from 'sweetalert2'

export const OpenCanButton = ({ bgColor, hoverBg, id }) => {
  const handleClick = () => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/can?id=${id}`)
      .then(res => res.json())
      .then((data) => {
        Swal.fire({
          icon: data.code,
          title: data.message,
          timer: 3000
        });
      })
  }

  return (
    <button
      className={`hover:bg-[${hoverBg}] py-[20px] text-white font-bold rounded-[10px] w-[80%] flex items-center justify-center bg-[${bgColor}]`}
      onClick={handleClick}
    >
      Open can
    </button>
  );
};
