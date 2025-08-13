"use client"

import { RiDeleteBin7Line } from "react-icons/ri";
import { OpenCanButton } from "./OpenCanButton"
import { useEffect, useState } from "react";

export const MainPage = () => {
  const [trashVolume, setTrashVolume] = useState(null);
  const [trashWeight, setTrashWeight] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/trash/trash-volume`)
        .then((res) => res.json())
        .then((data) => {
          setTrashVolume(data.trashVolume[data.trashVolume.length - 1]);
          setTrashWeight(data.trashWeight);
        })
    }
    fetchData();

    setInterval(fetchData, 1 * 60 * 1000);
  }, [])

  return (
    <>
      {trashVolume && (
        <>
          <div className="flex justify-between" data-aos="fade-up">
            <div className="bg-[#D9D9D9] shadow-xl rounded-[8px] overflow-hidden">
              <div className="bg-[#62975D] p-[100px] text-white text-[150px]">
                <RiDeleteBin7Line />
              </div>
              <div className="mt-[30px] w-full">
                <div className="flex flex-col justify-center items-center mb-[30px]">
                  <div className="text-[18px] font-bold">{`Percentage of trash: ${trashVolume.percentage1}%`}</div>
                  <div className="text-[18px] font-bold">Trash volume: {trashWeight ? `${trashWeight.w1}kg` : "kg"}</div>
                </div>
                <div className="flex justify-center mb-[25px]">
                  <OpenCanButton
                    bgColor={"#62975D"}
                    hoverBg={"#62975db7"}
                    id={1}
                  />
                </div>
              </div>
            </div>
            <div className="bg-[#D9D9D9] shadow-xl rounded-[8px] overflow-hidden">
              <div className="bg-[#50537E] p-[100px] text-white text-[150px]">
                <RiDeleteBin7Line />
              </div>
              <div className="mt-[30px] w-full">
                <div className="flex flex-col justify-center items-center mb-[30px]">
                  <div className="text-[18px] font-bold">{`Percentage of trash: ${trashVolume.percentage2}%`}</div>
                  <div className="text-[18px] font-bold">Trash volume: {trashWeight ? `${trashWeight.w2}kg` : "kg"}</div>
                </div>
                <div className="flex justify-center mb-[25px]">
                  <OpenCanButton
                    bgColor={"#50537E"}
                    hoverBg={"#50537eb0"}
                    id={2}
                  />
                </div>
              </div>
            </div>
            <div className="bg-[#D9D9D9] shadow-xl rounded-[8px] overflow-hidden">
              <div className="bg-[#66655F] p-[100px] text-white text-[150px]">
                <RiDeleteBin7Line />
              </div>
              <div className="mt-[30px] w-full">
                <div className="flex flex-col justify-center items-center mb-[30px]">
                  <div className="text-[18px] font-bold">{`Percentage of trash: ${trashVolume.percentage3}%`}</div>
                  <div className="text-[18px] font-bold">Trash volume: {trashWeight ? `${trashWeight.w3}kg` : "kg"}</div>
                </div>
                <div className="flex justify-center mb-[25px]">
                  <OpenCanButton
                    bgColor={"#66655F"}
                    hoverBg={"#66655fb0"}
                    id={3}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-[30px] flex justify-center mx-[50px]">
            <OpenCanButton
              bgColor={"#66655F"}
              hoverBg={"#66655fb0"}
              id={4}
            />
          </div>
        </>
      )}
    </>
  );
}