"use client"

import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth"
import { useEffect, useState } from "react";
import LineChart from "./LineChart";

export const MainPage = () => {
  const router = useRouter();
  const { isLogin, infoUser, isLoading } = useAuth();
  const [chartData, setChartData] = useState(null);
  const [tableData, setTableData] = useState(null);

  useEffect(() => {
    if (!isLogin && !isLoading) router.push("/account/login");
  }, [isLogin, router, isLoading]);

  useEffect(() => {
    const fetchData1 = () => {
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/trash/trash-volume`)
        .then(res => res.json())
        .then((data) => {
          const labels = data.data.map(item =>
            new Date(item.hour).toLocaleString([], {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false
            })
          )
          const dataPoints1 = data.data.map(item => item.percentage1);
          const dataPoints2 = data.data.map(item => item.percentage2);
          const dataPoints3 = data.data.map(item => item.percentage3);

          setChartData({
            labels,
            dataPoints1,
            dataPoints2,
            dataPoints3
          });
        })
    }

    fetchData1();

    setInterval(fetchData1, 1 * 60 * 1000);
  }, []);

  useEffect(() => {
    const fetchData2 = () => {
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/can/get-req-stas`)
      .then(res => res.json())
      .then((data) => {
        setTableData(data.data);
      })
    }

    fetchData2();

    setInterval(fetchData2, 1 * 60 * 1000);
  }, [])

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      {isLogin && chartData && (
        <div className="ml-[350px] mr-[30px]">
          <div className="flex justify-center items-center w-full py-[50px] gap-[50px]">
            <div className="w-full max-w-3xl">
              {chartData && (
                <LineChart
                  labels={chartData.labels}
                  dataPoints1={chartData.dataPoints1}
                  dataPoints2={chartData.dataPoints2}
                  dataPoints3={chartData.dataPoints3}
                />
              )}
            </div>
            <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-lg">
              <div className="text-center text-[20px] font-bold mb-[20px] text-gray-700">Open-can Statistics</div>
              <table className="min-w-full divide-y divide-gray-200 text-center">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-[10px] py-3 text-[12px] font-bold text-gray-700">Name</th>
                    <th className="px-[10px] py-3 text-[12px] font-bold text-gray-700">Date - Hour</th>
                    <th className="px-[10px] py-3 text-[12px] font-bold text-gray-700">Count</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData && tableData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-[10px] text-[11px] py-3 whitespace-nowrap">{item.name}</td>
                      <td className="px-[10px] text-[11px] py-3 whitespace-nowrap">{new Date(item.date).toLocaleString()}</td>
                      <td className="px-[10px] text-[11px] py-3 whitespace-nowrap">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
