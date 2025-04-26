// src/components/FeedbackWall/FeedbackChart.js (修正 X 軸刻度配置)

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler );

function FeedbackChart({ labels, datasets }) {
  const data = {
    labels: labels, // 這個 labels 數組現在可能包含換行符 '\n'
    datasets: datasets.map(ds => ({ ...ds, fill: false, tension: 0.1, pointBackgroundColor: ds.borderColor, pointBorderColor: '#fff', pointHoverBackgroundColor: '#fff', pointHoverBorderColor: ds.borderColor })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', },
      title: { display: true, text: '社交技能評分趨勢 (0-100分)', },
      tooltip: { mode: 'index', intersect: false, }
    },
    scales: {
      y: { beginAtZero: true, max: 100, title: { display: true, text: '分數' } },
      x: { // <<<--- 修改這裡
         title: { display: true, text: '練習時間' },
         ticks: {
             autoSkip: true, // 保持自動跳過
             maxRotation: 0, // <<<--- 設置為 0，防止標籤傾斜
             minRotation: 0,
             // 不需要特殊處理換行，Chart.js 3.x+ 會自動處理數組或帶 \n 的字符串標籤
         }
      } // <<<--- 結束修改
    },
    interaction: { mode: 'index', intersect: false, },
  };

  return (
    <div style={{ position: 'relative', height: '300px', width: '100%' }}>
       <Line options={options} data={data} />
    </div>
   );
}

export default FeedbackChart;