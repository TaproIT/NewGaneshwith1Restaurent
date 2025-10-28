import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register chart components
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const MonthlyGuestRegistration: React.FC = () => {
  // Labels for 12 months
  const labels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Chart data
  const data = {
    labels,
    datasets: [
      {
        label: "Hotel A",
        data: [120, 140, 180, 160, 200, 250, 220, 260, 240, 300, 320, 280],
        borderColor: "rgba(91, 155, 213, 1)",
        backgroundColor: "rgba(91, 155, 213, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Hotel B",
        data: [100, 130, 150, 170, 190, 230, 210, 250, 270, 290, 310, 330],
        borderColor: "rgba(234, 62, 47, 1)",
        backgroundColor: "rgba(234, 62, 47, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Monthly Guest Registration",
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Months",
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Guests",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-4 bg-mainWhite rounded-2xl w-full h-[400px]">
      <Line data={data} options={options} />
    </div>
  );
};

export default MonthlyGuestRegistration;
