// src/components/FeedbackWall/ChartModal.js (移除潛在的 disabled 屬性)

import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Row, Col, Form, Alert } from 'react-bootstrap';
import FeedbackChart from './FeedbackChart';
import DatePicker, { registerLocale } from 'react-datepicker';
import zhTW from 'date-fns/locale/zh-TW';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('zh-TW', zhTW);

// 指標定義
const ALL_METRICS = [
  { key: 'clarity', label: '清晰度', color: 'rgba(54, 162, 235, 0.6)' },
  { key: 'empathy', label: '同理心', color: 'rgba(255, 206, 86, 0.6)' },
  { key: 'confidence', label: '自信', color: 'rgba(75, 192, 192, 0.6)' },
  { key: 'appropriateness', label: '適當性', color: 'rgba(153, 102, 255, 0.6)' },
  { key: 'goalAchievement', label: '目標達成', color: 'rgba(255, 99, 132, 0.6)' },
];

function ChartModal({ show, onHide, feedbackData }) {
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedMetrics, setSelectedMetrics] = useState(ALL_METRICS.map(m => m.key));

  // 應用篩選
  const filteredChartData = useMemo(() => {
    let result = [...feedbackData];
    const [startDate, endDate] = dateRange;
    if (startDate) { result = result.filter(fb => fb.timestamp >= startDate.getTime()); }
    if (endDate) { result = result.filter(fb => fb.timestamp < (endDate.getTime() + 24 * 60 * 60 * 1000)); }
    return result.sort((a, b) => a.timestamp - b.timestamp);
  }, [feedbackData, dateRange]);

  // 準備圖表數據
  const recentChartData = filteredChartData.slice(-10); // 最多顯示最近 10 筆
  const chartLabels = recentChartData.map((fb) => new Date(fb.timestamp).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }));
  const getScore = (score) => (score === null || score === undefined ? 0 : score);
  const chartDataSets = useMemo(() => {
      return ALL_METRICS
          .filter(metric => selectedMetrics.includes(metric.key))
          .map(metric => ({ label: metric.label, data: recentChartData.map(fb => getScore(fb.scores?.[metric.key])), backgroundColor: metric.color, borderColor: metric.color.replace('0.6', '1'), borderWidth: 1, fill: false, tension: 0.1 }));
  }, [recentChartData, selectedMetrics]);

  // 指標選擇變化
  const handleMetricChange = (event) => {
    const { value, checked } = event.target;
    setSelectedMetrics(prev =>
      checked ? [...prev, value] : prev.filter(metricKey => metricKey !== value)
    );
  };

  // 清除所有篩選
   const clearAllChartFilters = () => {
      setDateRange([null, null]);
      setSelectedMetrics(ALL_METRICS.map(m => m.key));
   };

  return (
    <Modal show={show} onHide={onHide} centered size="xl">
      <Modal.Header closeButton>
        <Modal.Title>表現趨勢圖表</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ minHeight: '500px' }}>
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
                locale="zh-TW"
                maxDate={new Date()}
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
                     // --- 確保這裡沒有 disabled 屬性 ---
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
        {filteredChartData.length > 0 ? (
             chartDataSets.length > 0 ? (
                <FeedbackChart labels={chartLabels} datasets={chartDataSets} />
             ) : ( <Alert variant="warning" size="sm">請至少選擇一個要顯示的指標。</Alert> )
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