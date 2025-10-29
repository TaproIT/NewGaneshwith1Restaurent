// MonthlyBeverageSales.jsx
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MonthlyBeverageSales = () => {
  const labels = [
    "Jan-20", "Feb-20", "Mar-20", "Apr-20", "May-20", "Jun-20",
    "Jul-20", "Aug-20", "Sep-20", "Oct-20", "Nov-20", "Dec-20"
  ];

  const data = {
    labels,
    datasets: [
      { label: "Soft Drinks", data: [120,150,180,200,170,190,210,230,220,240,250,270], backgroundColor: "rgba(91, 155, 213, 1)" },
      { label: "Cola", data: [90,100,120,150,130,160,180,170,200,210,220,230], backgroundColor: "rgba(237, 125, 49, 1)" },
      { label: "Hard Liqueur", data: [60,70,80,90,100,110,120,130,140,150,160,170], backgroundColor: "rgba(165, 165, 165, 1)" },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // important!
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: "Monthly Beverage Sales" },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: true } },
    },
    elements: {
      bar: { borderRadius: 4, barPercentage: 0.5, categoryPercentage: 0.7 },
    },
  };

  return (
    <div className="p-4 bg-mainWhite rounded-2xl w-full h-[400px]">
      <Bar data={data} options={options} />
    </div>
  );
};

export default MonthlyBeverageSales;
