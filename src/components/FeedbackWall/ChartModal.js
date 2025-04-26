// src/components/FeedbackWall/ChartModal.js (顯示完整年月日時間 X 軸標籤)

import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Row, Col, Form, Alert } from 'react-bootstrap';
import FeedbackChart from './FeedbackChart'; // 確保導入 FeedbackChart
import DatePicker, { registerLocale } from 'react-datepicker'; // 導入 DatePicker 和 registerLocale
import zhTW from 'date-fns/locale/zh-TW'; // 導入繁體中文語言包
import 'react-datepicker/dist/react-datepicker.css'; // 導入 DatePicker 的 CSS

// 註冊繁體中文語言包
registerLocale('zh-TW', zhTW);

// 定義所有可選的指標和對應顏色 (與 FeedbackWall.js 保持一致)
const ALL_METRICS = [
  { key: 'clarity', label: '清晰度', color: 'rgba(54, 162, 235, 0.6)' },
  { key: 'empathy', label: '同理心', color: 'rgba(255, 206, 86, 0.6)' },
  { key: 'confidence', label: '自信', color: 'rgba(75, 192, 192, 0.6)' },
  { key: 'appropriateness', label: '適當性', color: 'rgba(153, 102, 255, 0.6)' },
  { key: 'goalAchievement', label: '目標達成', color: 'rgba(255, 99, 132, 0.6)' },
];
// 提取分數輔助函數
const getScore = (score) => (score === null || score === undefined ? 0 : score);


function ChartModal({ show, onHide, feedbackData }) {
  // --- 篩選狀態 ---
  const [dateRange, setDateRange] = useState([null, null]); // [startDate, endDate]
  const [selectedMetrics, setSelectedMetrics] = useState(ALL_METRICS.map(m => m.key)); // 初始全選指標

  // --- 應用篩選 ---
  const filteredChartData = useMemo(() => {
    let result = [...feedbackData];
    const [startDate, endDate] = dateRange;

    // 按日期範圍篩選
    if (startDate) {
        result = result.filter(fb => fb.timestamp >= startDate.getTime());
    }
    if (endDate) {
        // 包含結束日期當天的所有時間
        result = result.filter(fb => fb.timestamp < (endDate.getTime() + 24 * 60 * 60 * 1000));
    }

    // 按時間升序排列 (舊到新，適合圖表)
    return result.sort((a, b) => a.timestamp - b.timestamp);

  }, [feedbackData, dateRange]); // 依賴傳入數據和日期範圍

  // --- 準備圖表 Labels 和 Datasets ---
  // 只顯示最近最多 10 筆符合篩選的數據點
  const recentChartData = filteredChartData.slice(-10);

  // --- 修改 chartLabels 生成邏輯 ---
  const chartLabels = recentChartData.map((fb) => {
    const date = new Date(fb.timestamp);
    // 選項：包含年月日 (zh-TW 格式會是 YYYY/M/D)
    const optionsDate = { year: 'numeric', month: 'numeric', day: 'numeric' };
    // 選項：包含時分 (24小時制)
    const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: false };

    const dateString = date.toLocaleDateString('zh-TW', optionsDate);
    const timeString = date.toLocaleTimeString('zh-TW', optionsTime);

    // 總是顯示完整的日期和時間，用換行符分隔
    return `${dateString}\n${timeString}`;
  });
  // --- 結束修改 ---

  // 準備圖表數據集 (Datasets)
  const chartDataSets = useMemo(() => {
      return ALL_METRICS
          .filter(metric => selectedMetrics.includes(metric.key)) // 只包含選中的指標
          .map(metric => ({
              label: metric.label,
              data: recentChartData.map(fb => getScore(fb.scores?.[metric.key])), // 使用 recentChartData
              backgroundColor: metric.color,
              borderColor: metric.color.replace('0.6', '1'),
              borderWidth: 1,
              fill: false,
              tension: 0.1
          }));
  }, [recentChartData, selectedMetrics]); // 依賴 recentChartData 和 selectedMetrics

  // --- 處理指標選擇變化 ---
  const handleMetricChange = (event) => {
    const { value, checked } = event.target;
    setSelectedMetrics(prev =>
      checked ? [...prev, value] : prev.filter(metricKey => metricKey !== value)
    );
  };

  // --- 清除所有篩選 ---
   const clearAllChartFilters = () => {
      setDateRange([null, null]);
      setSelectedMetrics(ALL_METRICS.map(m => m.key));
   };

  return (
    <Modal show={show} onHide={onHide} centered size="xl"> {/* 使用 extra large 尺寸 */}
      <Modal.Header closeButton>
        <Modal.Title>表現趨勢圖表</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ minHeight: '500px' }}> {/* 設置最小高度 */}
        {/* --- 篩選控制項 --- */}
        <Row className="mb-3 align-items-center g-2">
          {/* 日期範圍選擇器 */}
          <Col md={5} lg={4}>
            <Form.Group>
              <Form.Label className="small mb-1">日期範圍:</Form.Label>
              <DatePicker
                selectsRange={true}
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                onChange={(update) => setDateRange(update)}
                isClearable={true}
                dateFormat="yyyy/MM/dd"
                className="form-control form-control-sm"
                placeholderText="選擇開始與結束日期"
                locale="zh-TW" // 應用中文
                maxDate={new Date()} // 最多選到今天
              />
            </Form.Group>
          </Col>
          {/* 指標選擇 */}
          <Col md={7} lg={6}>
             <Form.Group>
               <Form.Label className="small mb-1">顯示指標:</Form.Label>
               <div className="d-flex flex-wrap">
                 {ALL_METRICS.map(metric => (
                   <Form.Check
                     key={metric.key}
                     inline
                     type="checkbox"
                     id={`chart-modal-metric-${metric.key}`}
                     label={metric.label}
                     value={metric.key}
                     checked={selectedMetrics.includes(metric.key)}
                     onChange={handleMetricChange}
                     size="sm"
                     className="me-2 mb-1"
                     // 確保沒有 disabled
                   />
                 ))}
               </div>
             </Form.Group>
          </Col>
          {/* 清除篩選按鈕 */}
          <Col md={12} lg={2} className="text-lg-end mt-2 mt-lg-0 align-self-end">
            <Button
                variant="outline-secondary"
                size="sm"
                onClick={clearAllChartFilters}
                disabled={dateRange[0] === null && dateRange[1] === null && selectedMetrics.length === ALL_METRICS.length}
            >
                <i className="bi bi-x-lg"></i> 清除篩選
            </Button>
          </Col>
        </Row>
        <hr/>

        {/* --- 圖表 --- */}
        {/* 判斷邏輯基於 filteredChartData (篩選後的完整數據) */}
        {filteredChartData.length > 0 ? (
             chartDataSets.length > 0 ? ( // 確保有選中的指標
                // 傳遞計算好的 labels 和 datasets
                <FeedbackChart labels={chartLabels} datasets={chartDataSets} />
             ) : (
                <Alert variant="warning" size="sm">請至少選擇一個要顯示的指標。</Alert>
             )
        ) : (
          <Alert variant="info" size="sm">
             {dateRange[0] || dateRange[1] ? '選定的篩選條件內沒有回饋數據。' : '沒有回饋數據可供顯示圖表。'}
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          關閉
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ChartModal;