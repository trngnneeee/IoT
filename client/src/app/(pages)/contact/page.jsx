export default function Contact() {
  return (
    <>
      <div className="w-full">
        <div className="flex flex-col lg:flex-row justify-between gap-[30px] lg:gap-[50px] xl:gap-[100px] py-[30px] lg:py-[80px] px-[30px] sm:px-[60px] lg:px-[100px] mb-[30px]" data-aos="fade-up">
          <div className="w-full mb-[30px] mt-[30px]">
            <div className="text-[18px] xl:text-[20px] font-[600] text-[#505050] mb-[10px]">University Of Science - Vietnam National University</div>
            <div className="text-[14px] xl:text-[16px] font-light text-[#505050]">Address: 227 Nguyen Van Cu Street, Ward 4, District 5, Ho Chi Minh City</div>
            <div className="text-[14px] xl:text-[16px] font-light text-[#505050]">Phone: 0911398029 (Mr.Nguyen)</div>
            <div className="text-[14px] xl:text-[16px] font-light text-[#505050]">Email: dtn06052005@gmail.com</div>
          </div>
          <div className="w-full">
            <form>
              <div className="text-[24px] xl:text-[30px] font-bold text-[#505050] mb-[20px] sm:mb-[30px]">Contact</div>
              <div className="flex gap-[50px] items-center mb-[20px] sm:mb-[30px]">
                <div className="flex flex-col w-full">
                  <label className="text-[12px] sm:text-[14px] font-bold text-[#505050] mb-[8px]">Full Name<span className="text-[red]">*</span></label>
                  <input
                    type="text"
                    className="border-b-[1px] border-b-[#ddd] outline-none pb-[3px] cursor-pointer text-[12px] sm:text-[14px] text-[#505050] font-[400]"
                  />
                </div>
                <div className="flex flex-col w-full">
                  <label className="text-[12px] sm:text-[14px] font-bold text-[#505050] mb-[8px]">Phone<span className="text-[red]">*</span></label>
                  <input
                    type="text"
                    className="border-b-[1px] border-b-[#ddd] outline-none pb-[3px] cursor-pointer text-[12px] sm:text-[14px] text-[#505050] font-[400]"
                  />
                </div>
              </div>
              <div className="flex flex-col mb-[20px] sm:mb-[30px] w-full">
                <label className="text-[12px] sm:text-[14px] font-bold text-[#505050] mb-[8px]">Title<span className="text-[red]">*</span></label>
                <input
                  type="text"
                  className="border-b-[1px] border-b-[#ddd] outline-none pb-[3px] cursor-pointer text-[12px] sm:text-[14px] text-[#505050] font-[400]"
                />
              </div>
              <div className="flex flex-col w-full mb-[30px]">
                <label className="text-[12px] sm:text-[14px] font-bold text-[#505050] mb-[8px]">Content<span className="text-[red]">*</span></label>
                <input
                  type="text"
                  className="border-b-[1px] border-b-[#ddd] outline-none pb-[3px] cursor-pointer text-[12px] sm:text-[14px] text-[#505050] font-[400]"
                />
              </div>
              <button className="cursor-pointer bg-[#505050] hover:bg-[#505050bd] w-full px-[30px] py-[10px] rounded-[15px] text-white text-[14px] sm:text-[18px] font-bold">Send</button>
            </form>
          </div>
        </div>
        <div className="h-[300px]">
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2391.238848149624!2d106.67975258108248!3d10.762375713895937!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f1c06f4e1dd%3A0x43900f1d4539a3d!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBLaG9hIGjhu41jIFThu7Egbmhpw6puIC0gxJDhuqFpIGjhu41jIFF14buRYyBnaWEgVFAuSENN!5e0!3m2!1svi!2s!4v1748234981473!5m2!1svi!2s" className="w-full h-full"></iframe>
        </div>
      </div>
    </>
  );
}