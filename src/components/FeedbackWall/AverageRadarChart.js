// src/components/FeedbackWall/AverageRadarChart.js (新增文件)

import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale, // <<<--- 雷達圖需要
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

// --- 註冊雷達圖需要的元素 ---
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// 假設這是從外部傳入的指標和顏色信息
// const ALL_METRICS = [ { key: 'clarity', label: '清晰度' }, ... ];

function AverageRadarChart({ averageScores }) { // 接收計算好的平均分對象

  // 準備雷達圖數據
  const labels = Object.keys(averageScores); // 指標名稱作為標籤
  const dataPoints = Object.values(averageScores); // 平均分作為數據點

  const data = {
    labels: labels.map(key => {
        // 嘗試從一個映射中獲取更友好的標籤名，如果沒有就用 key
        const metricMap = { clarity: '清晰度', empathy: '同理心', confidence: '自信', appropriateness: '適當性', goalAchievement: '目標達成' };
        return metricMap[key] || key;
    }),
    datasets: [
      {
        label: '平均分數',
        data: dataPoints,
        backgroundColor: 'rgba(90, 103, 216, 0.2)', // 使用主色調的半透明色
        borderColor: 'rgba(90, 103, 216, 1)', // 使用主色調
        borderWidth: 1,
        pointBackgroundColor: 'rgba(90, 103, 216, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(90, 103, 216, 1)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // 允許自訂高度
    scales: {
      r: { // 雷達圖的徑向軸 (分數)
        angleLines: { display: true },
        suggestedMin: 0,
        suggestedMax: 100, // 分數範圍 0-100
        ticks: {
            stepSize: 20 // 每 20 分一個刻度
        },
        pointLabels: { // 指標標籤的樣式
             font: {
                 size: 11 // 調整字體大小避免重疊
             }
        }
      }
    },
    plugins: {
      legend: {
        display: false // 通常雷達圖只有一個數據集，可以隱藏圖例
      },
      tooltip: {
        callbacks: {
          label: function(context) { // 自訂提示框顯示
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.r !== null) {
              label += context.parsed.r.toFixed(1); // 顯示到小數點後一位
            }
            return label;
          }
        }
      }
    }
  };

  return (
     <div style={{ position: 'relative', height: '300px', width: '100%', maxWidth: '400px', margin: 'auto' }}> {/* 控制大小 */}
        <Radar data={data} options={options} />
     </div>
  );
}

export default AverageRadarChart;