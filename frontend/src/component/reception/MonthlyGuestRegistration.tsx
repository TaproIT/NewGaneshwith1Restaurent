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
import type { HotelMonthlyStats } from "@/types/hotelMonthlyStats";

interface MonthlyGuestRegistrationProps {
  monthlyGuestsSummary?: HotelMonthlyStats[] | null;
}

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

const MonthlyGuestRegistration: React.FC<MonthlyGuestRegistrationProps> = ({
  monthlyGuestsSummary,
}) => {
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

  // Prepare data for Ganesh Garden Beach Cabana and Marakolliya Beach Resort dynamically from the prop
  const hotelAData = labels.map((_, index) => {
    const monthData = monthlyGuestsSummary?.find(
      (item) => item.monthNumber === index + 1
    );
    return monthData?.ganeshGardenBeachCabana ?? 0;
  });

  const hotelBData = labels.map((_, index) => {
    const monthData = monthlyGuestsSummary?.find(
      (item) => item.monthNumber === index + 1
    );
    return monthData?.marakolliyaBeachResort ?? 0;
  });

  // Chart data
  const data = {
    labels,
    datasets: [
      {
        label: "Ganesh Garden Beach Cabana",
        data: hotelAData,
        borderColor: "rgba(91, 155, 213, 1)",
        backgroundColor: "rgba(91, 155, 213, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Marakolliya Beach Resort",
        data: hotelBData,
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
