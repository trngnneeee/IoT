import { useState, useEffect, useRef } from "react";
import { TbMessageChatbotFilled } from "react-icons/tb";
import { IoClose } from "react-icons/io5";
import { LuSend } from "react-icons/lu";

export const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const chatbotRef = useRef(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatbotRef.current && !chatbotRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/chat-history`, {
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.chatHistory)
        {
          setChatHistory(data.chatHistory.chat);
        }
      })
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault();
    const chatContent = event.target.chat.value.trim();
    if (!chatContent) return;

    event.target.chat.value = "";

    const dataFinal = {
      message: chatContent
    };

    setChatHistory((prev) => [
      ...prev,
      { id: 1, chat: chatContent }
    ]);
    setIsLoading(true);

    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dataFinal),
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "success") {
          setChatHistory((prev) => [
            ...prev,
            { id: 2, chat: data.reply }
          ]);
        }
      })
      .catch((err) => {
        setChatHistory((prev) => [
          ...prev,
          { id: 2, chat: "Đã có lỗi xảy ra khi phản hồi." }
        ]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };


  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div
          ref={chatbotRef}
          className="w-[400px] h-[500px] bg-white rounded-xl shadow-2xl border border-gray-300 flex flex-col"
        >
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Chatbot</h3>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-black">
              <IoClose className="text-2xl" />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto text-sm text-gray-700">
            <p>Xin chào! Bạn cần tôi giúp gì hôm nay?</p>
            <div className="flex-1 p-3 overflow-y-auto text-sm text-gray-700 space-y-3">
              {chatHistory?.length > 0 ? (
                <>
                  {chatHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.id === 1 ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-lg shadow ${msg.id === 1
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-gray-200 text-gray-800 rounded-bl-none"
                          }`}
                      >
                        {msg.chat}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[70%] px-4 py-2 rounded-lg shadow bg-gray-100 text-gray-500 italic">
                        ...
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-gray-400">Chưa có cuộc hội thoại nào.</p>
              )}
            </div>
          </div>

          <form onSubmit={(event) => handleSubmit(event)} className="p-2 border-t border-gray-200">
            <div className="flex gap-[5px] px-[5px]">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                id="chat"
              />
              <button className="bg-gray-300 hover:bg-gray-200 px-[10px] rounded-md border">
                <LuSend />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-white p-3 rounded-[20px] shadow-xl border border-gray-300 hover:scale-105 transition"
        >
          <TbMessageChatbotFilled className="text-[32px] text-gray-800" />
        </button>
      )}
    </div>
  );
};
