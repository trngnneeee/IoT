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

const LineChart = ({ labels, dataPoints }) => {
  const data = {
    labels: labels, 
    datasets: [
      {
        label: "Percentage (%)",
        data: dataPoints, 
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        fill: true,
        tension: 0.3, 
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "10-Minutes Waste Volume Chart",
        font: {
          size: 24,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
      legend: {
        position: "top",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Hour",
        },
      },
      y: {
        title: {
          display: true,
          text: "Percentage (%)",
        },
        min: 0,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default LineChart;
