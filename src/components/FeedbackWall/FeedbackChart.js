// src/components/FeedbackWall/FeedbackChart.js (改為折線圖)

import React from 'react';
// --- 導入 Line 而不是 Bar ---
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  // --- 移除 BarElement ---
  // BarElement,
  // --- 添加 LineElement 和 PointElement ---
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // (可選) 如果你想在線條下方填充顏色
} from 'chart.js';

// --- 更新註冊的元素 ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement, // 添加
  LineElement,  // 添加
  Title,
  Tooltip,
  Legend,
  Filler // (可選)
);

function FeedbackChart({ labels, datasets }) {
  const data = {
    labels: labels,
    datasets: datasets.map(ds => ({
        ...ds,
        // --- (可選) 為折線圖添加特定樣式 ---
        fill: false, // 不填充線條下方顏色 (多條線時更清晰)
        tension: 0.1, // 給線條一點張力，使其平滑
        pointBackgroundColor: ds.borderColor, // 點的背景色同邊框色
        pointBorderColor: '#fff', // 點的邊框色
        pointHoverBackgroundColor: '#fff', // 鼠標懸停時點的背景色
        pointHoverBorderColor: ds.borderColor, // 鼠標懸停時點的邊框色
        // pointRadius: 3, // 可以設置點的大小
        // pointHoverRadius: 5, // 懸停時點的大小
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '社交技能評分趨勢 (0-100分)',
      },
      tooltip: {
         mode: 'index',
         intersect: false,
         // (可選) 自訂 Tooltip 樣式
         // callbacks: { ... }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
           display: true,
           text: '分數'
        }
      },
      x: {
         title: {
            display: true,
            text: '練習時間'
         },
         ticks: {
             autoSkip: true,
             maxRotation: 45,
             minRotation: 0
         }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    // --- (可選) 添加 hover 效果配置 ---
    // hover: {
    //   mode: 'nearest',
    //   intersect: true
    // }
  };

  return (
    <div style={{ position: 'relative', height: '300px', width: '100%' }}>
       {/* --- 將 Bar 改為 Line --- */}
       <Line options={options} data={data} />
    </div>
   );
}

export default FeedbackChart;