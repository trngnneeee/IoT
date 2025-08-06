"use client"

import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth"
import { useEffect, useState } from "react";
import LineChart from "./LineChart";

export const MainPage = () => {
  const router = useRouter();
  const { isLogin, infoUser, isLoading } = useAuth();
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!isLogin && !isLoading) router.push("/account/login");
  }, [isLogin, router, isLoading]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/trash/trash-volume`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setChartData(data.data);
        }
      })
  }, [])

  let labels = [];
  let dataPoints = [];
  if (chartData && chartData.length) {
    const valueMap = new Map();

    chartData.forEach((item) => {
      const rawDate = new Date(item.hour);
      const labelStr = rawDate.toLocaleTimeString("en-EN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      valueMap.set(labelStr, item.value);
    });

    // 10 phút gần nhất, từng phút một
    labels = Array.from({ length: 10 }, (_, i) => {
      const date = new Date();
      date.setMinutes(date.getMinutes() - (9 - i));
      return date.toLocaleTimeString("en-EN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    });

    dataPoints = labels.map((label) => valueMap.get(label) || 0);
  }

  if (isLoading) return <p>Loading...</p>;
  return (
    <>
      {isLogin && chartData && (
        <>
          <div className="ml-[350px] mr-[50px] pt-[100px]">
            <div className="flex flex-col justify-center items-center border-[3px] border-[#ddd] w-full py-[50px]">
              <div className="w-full max-w-3xl">
                <LineChart labels={labels} dataPoints={dataPoints} />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}