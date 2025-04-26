// src/components/CharacterHall/CharacterEvalModal.js (包含刪除、固定按鈕、列表渲染)

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal, Button, Alert, ListGroup, Badge, Collapse, Form, InputGroup, Row, Col } from 'react-bootstrap';
import ChartModal from '../FeedbackWall/ChartModal';
import AverageRadarChart from '../FeedbackWall/AverageRadarChart';
import './CharacterHall.css'; // 確保導入 CSS

const FEEDBACK_STORAGE_KEY = 'wingchat_feedback';
const ALL_METRICS = [ { key: 'clarity', label: '清晰度' }, { key: 'empathy', label: '同理心' }, { key: 'confidence', label: '自信' }, { key: 'appropriateness', label: '適當性' }, { key: 'goalAchievement', label: '目標達成' }, ];
const getScore = (score) => (score === null || score === undefined ? 0 : score);

function CharacterEvalModal({ show, onHide, character }) {
  const [originalCharacterFeedback, setOriginalCharacterFeedback] = useState([]);
  const [filteredCharacterFeedback, setFilteredCharacterFeedback] = useState([]);
  const [goalSearchModal, setGoalSearchModal] = useState('');
  const [showEvalFilters, setShowEvalFilters] = useState(false);
  const [showEvalChartModal, setShowEvalChartModal] = useState(false);
  const [showEvalRadarModal, setShowEvalRadarModal] = useState(false);

  // 加載原始數據函數
  const loadOriginalFeedback = useCallback(() => {
    if (show && character) {
      console.log(`EvalModal - Loading original feedback for character: ${character.name} (ID: ${character.id})`);
      const savedFeedback = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      let allFeedback = [];
      if (savedFeedback) { try { allFeedback = JSON.parse(savedFeedback); if (!Array.isArray(allFeedback)) allFeedback = []; } catch (e) { console.error("EvalModal - Failed to parse feedback history", e); allFeedback = []; } }
      const characterFeedback = allFeedback .filter(fb => fb.characterId === character.id && typeof fb.timestamp === 'number') .sort((a, b) => b.timestamp - a.timestamp);
      console.log(`EvalModal - Found ${characterFeedback.length} original records.`);
      setOriginalCharacterFeedback(characterFeedback);
    } else { setOriginalCharacterFeedback([]); }
    setGoalSearchModal(''); setShowEvalFilters(false); setShowEvalChartModal(false); setShowEvalRadarModal(false);
  }, [show, character]);

  // 監聽 show/character 變化以加載
  useEffect(() => { loadOriginalFeedback(); }, [loadOriginalFeedback]);

  // 監聽原始數據/篩選詞變化以更新 filtered
  useEffect(() => {
    let result = [...originalCharacterFeedback];
    if (goalSearchModal.trim()) { const lowerCaseGoal = goalSearchModal.trim().toLowerCase(); result = result.filter(fb => fb.goal?.toLowerCase().includes(lowerCaseGoal)); }
    setFilteredCharacterFeedback(result);
  }, [originalCharacterFeedback, goalSearchModal]);

  // 刪除回饋處理函數
  const handleDeleteFeedbackInModal = (timestampToDelete) => {
    const feedbackToDelete = originalCharacterFeedback.find(fb => fb.timestamp === timestampToDelete);
    if (feedbackToDelete && window.confirm(`確定要刪除這筆 ${new Date(timestampToDelete).toLocaleString('zh-TW')} 的回饋記錄嗎？\n目標：${feedbackToDelete.goal}`)) {
      try {
        const savedFeedback = localStorage.getItem(FEEDBACK_STORAGE_KEY);
        let allFeedback = [];
        if (savedFeedback) { allFeedback = JSON.parse(savedFeedback); if (!Array.isArray(allFeedback)) allFeedback = []; }
        const updatedAllHistory = allFeedback.filter(fb => fb.timestamp !== timestampToDelete);
        localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updatedAllHistory));
        console.log(`EvalModal - Deleted feedback with timestamp: ${timestampToDelete}`);
        loadOriginalFeedback(); // 重新加載觸發更新
      } catch (e) { console.error("Error deleting feedback from localStorage", e); alert("刪除回饋時發生錯誤。"); }
    }
  }

  // 計算平均分數
  const averageScores = useMemo(() => { const scoreSums = { clarity: 0, empathy: 0, confidence: 0, appropriateness: 0, goalAchievement: 0 }; const scoreCounts = { clarity: 0, empathy: 0, confidence: 0, appropriateness: 0, goalAchievement: 0 }; filteredCharacterFeedback.forEach(fb => { if (fb.scores) { ALL_METRICS.forEach(metric => { const score = fb.scores[metric.key]; if (score !== null && score !== undefined) { scoreSums[metric.key] += score; scoreCounts[metric.key]++; } }); } }); const averages = {}; ALL_METRICS.forEach(metric => { averages[metric.key] = scoreCounts[metric.key] > 0 ? scoreSums[metric.key] / scoreCounts[metric.key] : 0; }); return averages; }, [filteredCharacterFeedback]);

  // 清除 Modal 內的篩選
  const clearModalFilters = () => { setGoalSearchModal(''); };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" dialogClassName="character-eval-modal-dialog">
      <Modal.Header closeButton> <Modal.Title>與 "{character?.name}" 的對話評估</Modal.Title> </Modal.Header>
      <Modal.Body className="d-flex flex-column p-0 character-eval-modal-body">
         {/* 可收起的篩選區域 */}
         <div className="character-eval-filters bg-light p-3 border-bottom">
           <div className="d-flex justify-content-between align-items-center mb-2"> <h6 className="mb-0 text-muted small">搜尋對話目標</h6> <Button variant="link" size="sm" onClick={() => setShowEvalFilters(!showEvalFilters)} aria-controls="collapse-eval-filters" aria-expanded={showEvalFilters} className="p-0 text-secondary"> {showEvalFilters ? '收起' : '展開'} <i className={`bi bi-chevron-${showEvalFilters ? 'up' : 'down'}`}></i> </Button> </div>
           <Collapse in={showEvalFilters}>
             <div id="collapse-eval-filters">
                <InputGroup size="sm" className="mb-2"> <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text> <Form.Control type="text" placeholder="搜尋此角色的對話目標..." value={goalSearchModal} onChange={(e) => setGoalSearchModal(e.target.value)} /> </InputGroup>
                 {goalSearchModal && ( <Button variant="outline-secondary" size="sm" onClick={clearModalFilters} className="w-100"> 清除目標搜尋 </Button> )}
             </div>
           </Collapse>
         </div>
         {/* 固定的圖表按鈕區域 */}
         <div className="character-eval-chart-controls p-3 border-bottom">
             <div className="d-flex justify-content-end">
                 <Button variant="outline-success" size="sm" onClick={() => setShowEvalRadarModal(true)} disabled={filteredCharacterFeedback.length === 0} className="me-2"> <i className="bi bi-bullseye me-1"></i> 查看平均雷達圖 </Button>
                 <Button variant="outline-primary" size="sm" onClick={() => setShowEvalChartModal(true)} disabled={filteredCharacterFeedback.length === 0}> <i className="bi bi-graph-up me-1"></i> 查看趨勢圖表 </Button>
             </div>
         </div>
         {/* 固定的列表標題區域 */}
         <div className="feedback-list-header bg-white pt-3 pb-2 px-4 border-bottom">
           <h5 className="mb-0">詳細回饋記錄 ({filteredCharacterFeedback.length} 筆)</h5>
         </div>
        {/* 可滾動的內容區域 */}
        <div className="character-eval-content flex-grow-1 overflow-auto pt-0"> {/* 移除 padding-top */}
          {originalCharacterFeedback.length > 0 ? (
            <>
              {filteredCharacterFeedback.length > 0 ? (
                  <ListGroup variant="flush" className="p-4 pt-2"> {/* 在 ListGroup 添加 padding */}
                    {filteredCharacterFeedback.map(fb => (
                      <ListGroup.Item key={fb.timestamp} className="px-0 pt-3 pb-3 border-bottom feedback-list-item">
                         <div className="d-flex justify-content-between align-items-start">
                           <div className="flex-grow-1 me-2">
                             <div className="d-flex justify-content-between align-items-center mb-2"> <small className="text-muted">{new Date(fb.timestamp).toLocaleString('zh-TW', { dateStyle: 'short', timeStyle: 'short' })}</small> <Badge bg="light" text="dark">目標: {fb.goal || '未指定'}</Badge> </div>
                             {/* 顯示用戶上下文 */}
                             {fb.userMessagesContext && fb.userMessagesContext.length > 0 && ( <div className="mb-3 user-context-display"> <h6 className="text-muted small mb-1">你當時說的話 (參考):</h6> <blockquote className="blockquote blockquote-footer bg-light p-2 rounded small mb-0"> {fb.userMessagesContext.map((msg, index) => ( <p key={index} className="mb-1 context-message"> • {msg} </p> ))} </blockquote> </div> )}
                             <h6>AI 總結:</h6>
                             <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.95em', marginBottom: fb.scores ? '0.5rem' : '0' }}>{fb.summary || '-'}</p>
                             {/* 顯示所有評分 */}
                             {fb.scores && ( <> <p className="small mb-1">評分:</p> <ul className="list-inline small mb-0"> {ALL_METRICS.map(metric => { const scoreValue = fb.scores[metric.key]; const displayValue = (scoreValue === null || scoreValue === undefined) ? 'N/A' : getScore(scoreValue); const badgeBg = displayValue === 'N/A' ? 'light' : (getScore(scoreValue) >= 60 ? "success" : "warning"); return ( <li key={metric.key} className="list-inline-item me-3"> {metric.label}: <Badge pill bg={badgeBg} text={displayValue === 'N/A' ? 'dark' : undefined}> {displayValue} </Badge> </li> ); })} </ul> </> )}
                           </div>
                           <Button variant="outline-danger" size="sm" className="delete-feedback-btn p-0 flex-shrink-0 ms-2" onClick={() => handleDeleteFeedbackInModal(fb.timestamp)} title="刪除此筆回饋" style={{ lineHeight: 1, width: '24px', height: '24px' }}> <i className="bi bi-x-circle"></i> </Button>
                         </div>
                       </ListGroup.Item>
                    ))}
                  </ListGroup>
              ) : ( <Alert variant="warning" className="m-4">找不到符合目標關鍵字 "{goalSearchModal}" 的記錄。</Alert> )}
            </>
          ) : ( <Alert variant="info" className="m-4">還沒有與此角色的對話評估記錄。</Alert> )}
        </div>
      </Modal.Body>
      <Modal.Footer> <Button variant="secondary" onClick={onHide}> 關閉 </Button> </Modal.Footer>
       {/* 圖表 Modals */}
       <ChartModal show={showEvalChartModal} onHide={() => setShowEvalChartModal(false)} feedbackData={filteredCharacterFeedback}/>
       <Modal show={showEvalRadarModal} onHide={() => setShowEvalRadarModal(false)} centered>
         <Modal.Header closeButton> <Modal.Title>"{character?.name}" 平均表現雷達圖</Modal.Title> </Modal.Header>
         <Modal.Body> {filteredCharacterFeedback.length > 0 ? ( <AverageRadarChart averageScores={averageScores} /> ) : ( <Alert variant="info">沒有數據可計算平均分數。</Alert> )} <p className="text-muted small mt-3"> 注意：此雷達圖顯示的是當前目標篩選條件下，與此角色互動記錄的平均分數。 </p> </Modal.Body>
         <Modal.Footer> <Button variant="secondary" onClick={() => setShowEvalRadarModal(false)}> 關閉 </Button> </Modal.Footer>
       </Modal>
    </Modal>
  );
}

export default CharacterEvalModal;