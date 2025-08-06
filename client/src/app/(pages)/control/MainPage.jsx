import { RiDeleteBin7Line } from "react-icons/ri";

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
              <button className="bg-[#62975D] hover:bg-[#62975db7] py-[20px] text-white font-bold rounded-[10px] w-[80%] flex items-center justify-center">
                Open can
              </button>
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
              <button className="bg-[#50537E] hover:bg-[#50537eb0] py-[20px] text-white font-bold rounded-[10px] w-[80%] flex items-center justify-center">
                Open can
              </button>
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
              <button className="bg-[#66655F] hover:bg-[#66655fb0] py-[20px] text-white font-bold rounded-[10px] w-[80%] flex items-center justify-center">
                Open can
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-[50px]">
        <button className="bg-[#7E4F50] hover:bg-[#7e4f50a8] px-[50px] py-[20px] text-white font-bold text-[18px] rounded-[10px]">Open 3 Can</button>
      </div>
    </>
  );
}