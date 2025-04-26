// src/components/FeedbackWall/FeedbackWall.js (顯示所有指標，包括 N/A)

import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Alert, Badge, InputGroup, Form, Button, Collapse, Modal } from 'react-bootstrap';
import ChartModal from './ChartModal';
import AverageRadarChart from './AverageRadarChart';
import './FeedbackWall.css'; // 確保導入 CSS

const FEEDBACK_STORAGE_KEY = 'wingchat_feedback';
const ALL_METRICS = [
  { key: 'clarity', label: '清晰度' },
  { key: 'empathy', label: '同理心' },
  { key: 'confidence', label: '自信' },
  { key: 'appropriateness', label: '適當性' },
  { key: 'goalAchievement', label: '目標達成' },
];

function FeedbackWall() {
  const [originalFeedbackHistory, setOriginalFeedbackHistory] = useState([]);
  const [filteredFeedbackHistory, setFilteredFeedbackHistory] = useState([]);
  const [characterSearch, setCharacterSearch] = useState('');
  const [goalSearch, setGoalSearch] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [showChartModal, setShowChartModal] = useState(false);
  const [showRadarModal, setShowRadarModal] = useState(false);

  // 加載數據
  useEffect(() => {
    const savedFeedback = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    let parsedFeedback = [];
    if (savedFeedback) {
      try {
        parsedFeedback = JSON.parse(savedFeedback);
        if (!Array.isArray(parsedFeedback)) parsedFeedback = [];
        parsedFeedback = parsedFeedback
          .filter(fb => typeof fb.timestamp === 'number')
          .sort((a, b) => b.timestamp - a.timestamp);
      } catch (e) { console.error("Failed to parse feedback history", e); }
    }
    setOriginalFeedbackHistory(parsedFeedback);
    setFilteredFeedbackHistory(parsedFeedback);
  }, []);

  // 篩選數據
  useEffect(() => {
    let result = [...originalFeedbackHistory];
    if (characterSearch.trim()) {
      const lowerCaseSearch = characterSearch.trim().toLowerCase();
      result = result.filter(fb => fb.characterName?.toLowerCase().includes(lowerCaseSearch));
    }
    if (goalSearch.trim()) {
      const lowerCaseGoal = goalSearch.trim().toLowerCase();
      result = result.filter(fb => fb.goal?.toLowerCase().includes(lowerCaseGoal));
    }
    setFilteredFeedbackHistory(result);
  }, [originalFeedbackHistory, characterSearch, goalSearch]);

  // 清除篩選
  const clearFilters = () => {
    setCharacterSearch('');
    setGoalSearch('');
  };

  // 提取分數輔助函數
  const getScore = (score) => (score === null || score === undefined ? 0 : score);

  // 刪除回饋記錄
  const handleDeleteFeedback = (timestampToDelete) => {
    const feedbackToDelete = originalFeedbackHistory.find(fb => fb.timestamp === timestampToDelete);
    if (feedbackToDelete && window.confirm(`確定要刪除這筆 ${new Date(timestampToDelete).toLocaleString('zh-TW')} 的回饋記錄嗎？\n目標：${feedbackToDelete.goal}\n角色：${feedbackToDelete.characterName}`)) {
      const updatedHistory = originalFeedbackHistory.filter(fb => fb.timestamp !== timestampToDelete);
      setOriginalFeedbackHistory(updatedHistory);
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updatedHistory));
    }
  }

  // 計算平均分數
  const averageScores = useMemo(() => {
    const scoreSums = { clarity: 0, empathy: 0, confidence: 0, appropriateness: 0, goalAchievement: 0 };
    const scoreCounts = { clarity: 0, empathy: 0, confidence: 0, appropriateness: 0, goalAchievement: 0 };
    filteredFeedbackHistory.forEach(fb => {
      if (fb.scores) {
        ALL_METRICS.forEach(metric => {
          const score = fb.scores[metric.key];
          if (score !== null && score !== undefined) {
            scoreSums[metric.key] += score;
            scoreCounts[metric.key]++;
          }
        });
      }
    });
    const averages = {};
    ALL_METRICS.forEach(metric => {
      averages[metric.key] = scoreCounts[metric.key] > 0 ? scoreSums[metric.key] / scoreCounts[metric.key] : 0;
    });
    return averages;
  }, [filteredFeedbackHistory]);

  return (
    <Container fluid className="feedback-wall-container p-0 d-flex flex-column">
      {/* 固定的頭部區域 */}
      <div className="feedback-wall-header d-flex justify-content-between align-items-start">
        <div> <h2 className="mb-1">回饋牆</h2> <p className="text-muted mb-0 small">這裡彙總了你每次請求 AI 回饋的結果。</p> </div>
        <div className="d-flex flex-column align-items-end">
          <Button variant="outline-success" size="sm" onClick={() => setShowRadarModal(true)} disabled={filteredFeedbackHistory.length === 0} className="mb-2"> <i className="bi bi-bullseye me-1"></i> 查看平均雷達圖 </Button>
          <Button variant="outline-primary" size="sm" onClick={() => setShowChartModal(true)} disabled={filteredFeedbackHistory.length === 0}> <i className="bi bi-graph-up me-1"></i> 查看趨勢圖表 </Button>
        </div>
      </div>
      {/* 可收起的篩選控制項區域 */}
      <div className="feedback-filters-container">
        <div className="d-flex justify-content-between align-items-center mb-2"> <h6 className="mb-0 text-muted small">搜尋與篩選</h6> <Button variant="link" size="sm" onClick={() => setShowFilters(!showFilters)} aria-controls="collapse-feedback-filters" aria-expanded={showFilters} className="p-0 text-secondary"> {showFilters ? '收起' : '展開'} <i className={`bi bi-chevron-${showFilters ? 'up' : 'down'}`}></i> </Button> </div>
        <Collapse in={showFilters}>
          <div id="collapse-feedback-filters">
            <Row className="g-2 mb-2"> <Col md={6}><InputGroup size="sm"><InputGroup.Text><i className="bi bi-person"></i></InputGroup.Text><Form.Control type="text" placeholder="搜尋角色名稱..." value={characterSearch} onChange={(e) => setCharacterSearch(e.target.value)}/></InputGroup></Col> <Col md={6}><InputGroup size="sm"><InputGroup.Text><i className="bi bi-chat-dots"></i></InputGroup.Text><Form.Control type="text" placeholder="搜尋對話目標關鍵字..." value={goalSearch} onChange={(e) => setGoalSearch(e.target.value)}/></InputGroup></Col> </Row>
            {(characterSearch || goalSearch) && ( <Button variant="outline-secondary" size="sm" onClick={clearFilters} className="w-100"><i className="bi bi-x-lg"></i> 清除所有篩選</Button> )}
          </div>
        </Collapse>
        <h4 className="h5 mb-3" style={{ marginTop: '20px' }}>詳細回饋記錄 ({filteredFeedbackHistory.length} 筆)</h4>
      </div>
      
      {/* 可滾動的內容區域 */}
      <div className="feedback-wall-body">
        {/* 雷達圖顯示區域 (移除) */}
        {/* 歷史回饋列表 */}
        {filteredFeedbackHistory.length > 0 ? (
          filteredFeedbackHistory.map((fb) => (
            <Card key={fb.timestamp} className="shadow-sm feedback-card">
              <Card.Header className="d-flex justify-content-between align-items-center small text-muted flex-wrap">
                <span>{new Date(fb.timestamp).toLocaleString('zh-TW', { dateStyle: 'short', timeStyle: 'short' })}</span>
                <div className="d-flex align-items-center mt-1 mt-md-0">
                  <Badge bg="secondary" className="me-2">角色: {fb.characterName || '未知'}</Badge>
                  <Badge bg="info" text="dark" className="me-2">目標: {fb.goal || '未知'}</Badge>
                  <Button variant="outline-danger" size="sm" className="delete-feedback-btn p-0" onClick={() => handleDeleteFeedback(fb.timestamp)} title="刪除此筆回饋"> <i className="bi bi-x-circle"></i> </Button>
                </div>
              </Card.Header>
              <Card.Body>
                <Card.Subtitle className="mb-2 text-muted">AI 總結:</Card.Subtitle>
                <p style={{ whiteSpace: 'pre-wrap' }}>{fb.summary || '-'}</p>
                {/* --- 修改這裡：始終顯示所有評分指標 --- */}
                {fb.scores && ( // 僅當 scores 對象存在時顯示評分區域
                  <>
                    <hr />
                    <p className="small mb-1">評分細節:</p>
                    <ul className="list-inline small mb-0">
                      {ALL_METRICS.map(metric => {
                        const scoreValue = fb.scores[metric.key];
                        const displayValue = (scoreValue === null || scoreValue === undefined) ? 'N/A' : getScore(scoreValue);
                        const badgeBg = displayValue === 'N/A' ? 'light' : (getScore(scoreValue) >= 60 ? "success" : "warning");
                        return (
                          <li key={metric.key} className="list-inline-item me-3">
                            {metric.label}: <Badge pill bg={badgeBg} text={displayValue === 'N/A' ? 'dark' : undefined}>
                              {displayValue}
                            </Badge>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
                {/* --- 結束修改 --- */}
              </Card.Body>
            </Card>
          ))
        ) : ( <Alert variant="secondary" className="text-center">{characterSearch || goalSearch ? '找不到符合篩選條件的回饋記錄。' : '還沒有任何回饋記錄。'}</Alert> )}
      </div>
      {/* 圖表 Modal */}
      <ChartModal show={showChartModal} onHide={() => setShowChartModal(false)} feedbackData={filteredFeedbackHistory}/>
      {/* 雷達圖 Modal */}
      <Modal show={showRadarModal} onHide={() => setShowRadarModal(false)} centered>
        <Modal.Header closeButton> <Modal.Title>平均表現雷達圖</Modal.Title> </Modal.Header>
        <Modal.Body> {filteredFeedbackHistory.length > 0 ? ( <AverageRadarChart averageScores={averageScores} /> ) : ( <Alert variant="info">沒有數據可計算平均分數。</Alert> )} <p className="text-muted small mt-3"> 注意：此雷達圖顯示的是當前篩選條件下所有回饋記錄的平均分數。 </p> </Modal.Body>
        <Modal.Footer> <Button variant="secondary" onClick={() => setShowRadarModal(false)}> 關閉 </Button> </Modal.Footer>
      </Modal>
    </Container>
  );
}
export default FeedbackWall;