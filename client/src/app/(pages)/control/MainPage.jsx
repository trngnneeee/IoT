import { RiDeleteBin7Line } from "react-icons/ri";
import { OpenCanButton } from "./OpenCanButton"

export const MainPage = () => {
  return (
    <>
      <div className="flex justify-between" data-aos="fade-up">
        <div className="bg-[#D9D9D9] shadow-xl rounded-[8px] overflow-hidden">
          <div className="bg-[#62975D] p-[100px] text-white text-[150px]">
            <RiDeleteBin7Line />
          </div>
          <div className="mt-[30px] w-full">
            <div className="flex flex-col justify-center items-center mb-[30px]">
              <div className="text-[18px] font-bold">Percentage of trash: 70%</div>
              <div className="text-[18px] font-bold">Trash volume: 1.5kg</div>
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
              <div className="text-[18px] font-bold">Percentage of trash: 70%</div>
              <div className="text-[18px] font-bold">Trash volume: 1.5kg</div>
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
              <div className="text-[18px] font-bold">Percentage of trash: 70%</div>
              <div className="text-[18px] font-bold">Trash volume: 1.5kg</div>
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
      <div className="flex justify-center mt-[50px]">
        <OpenCanButton
          bgColor={"#7E4F50"}
          hoverBg={"#7e4f50a8"}
          id={4}
        />
      </div>
    </>
  );
}