import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
);

const LineChart = ({ labels, dataPoints1, dataPoints2, dataPoints3 }) => {
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Bin 1",
        data: dataPoints1,
        borderColor: "green",
        backgroundColor: "green",
        fill: false,
        tension: 0.3,
      },
      {
        label: "Bin 2",
        data: dataPoints2,
        borderColor: "blue",
        backgroundColor: "blue",
        fill: false,
        tension: 0.3,
      },
      {
        label: "Bin 3",
        data: dataPoints3,
        borderColor: "#66655F",
        backgroundColor: "#66655F",
        fill: false,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Percentage of Trash Line Chart",
        font: { size: 24, weight: "bold" },
      },
      tooltip: { mode: "index", intersect: false },
      legend: { position: "top" },
    },
    scales: {
      x: { title: { display: true, text: "Time (HH:mm)" } },
      y: {
        title: { display: true, text: "Percentage (%)" },
        min: 0,
        max: 100,
        ticks: { callback: (v) => `${v}%` },
      },
    },
  };

  return <Line data={data} options={options} />;
};
export default LineChart;