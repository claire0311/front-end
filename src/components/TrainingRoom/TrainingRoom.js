// src/components/TrainingRoom/TrainingRoom.js (包含同步刪除回饋、記錄用戶上下文)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Form, InputGroup, Container, Row, Col, Spinner, Alert, Button, Dropdown } from 'react-bootstrap';
import ChatDisplay from './ChatDisplay';
import MessageInput from './MessageInput';
import { sendMessageToOllama, getFeedbackFromOllama } from '../../services/ollamaService'; // 確保路徑正確
import '../../styles/TrainingRoom.css'; // 確保路徑正確

const CHAT_HISTORY_PREFIX = 'wingchat_history_';
const FEEDBACK_STORAGE_KEY = 'wingchat_feedback';

function TrainingRoom({ characters, selectedCharacter, onSelectCharacter, setActiveView }) {
  const [goal, setGoal] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingFeedback, setIsGettingFeedback] = useState(false);
  const [error, setError] = useState(null);
  const currentGoalRef = useRef(goal);

  const getStorageKey = useCallback(() => { if (!selectedCharacter || !goal.trim()) return null; const goalKey = goal.trim().substring(0, 50).replace(/[^a-zA-Z0-9-_]/g, '_'); return `${CHAT_HISTORY_PREFIX}${selectedCharacter.id}_${goalKey}`; }, [selectedCharacter, goal]);
  useEffect(() => { currentGoalRef.current = goal; const storageKey = getStorageKey(); if (storageKey) { const savedHistory = localStorage.getItem(storageKey); if (savedHistory) { try { setMessages(JSON.parse(savedHistory)); } catch (e) { console.error("Parsing chat history failed", e); setMessages([]); } } else { setMessages([]); } } else if (selectedCharacter) { setMessages([]); } setError(null); }, [selectedCharacter, goal, getStorageKey]);
  useEffect(() => { const storageKey = getStorageKey(); if (storageKey && messages.length > 0) { localStorage.setItem(storageKey, JSON.stringify(messages)); } else if (storageKey && messages.length === 0 && localStorage.getItem(storageKey)) { localStorage.removeItem(storageKey); console.log(`Removed chat history from localStorage on clear: ${storageKey}`); } }, [messages, getStorageKey]);

  // 清除聊天記錄並同步刪除相關回饋
  const handleClearChat = () => {
      if (!selectedCharacter || !goal.trim()) return;
      const characterName = selectedCharacter.name; const currentGoal = goal.trim(); const characterId = selectedCharacter.id;
      if (window.confirm(`確定要清除與 ${characterName} 關於目標「${currentGoal}」的所有聊天記錄嗎？\n\n⚠️ 這將同時刪除所有與此對話相關的回饋記錄！`)) {
          setMessages([]); // 清除狀態，觸發 useEffect 移除聊天記錄
          try {
              const savedFeedback = localStorage.getItem(FEEDBACK_STORAGE_KEY); let allFeedback = [];
              if (savedFeedback) { allFeedback = JSON.parse(savedFeedback); if (!Array.isArray(allFeedback)) allFeedback = []; }
              const updatedFeedbackHistory = allFeedback.filter(fb => !(fb.characterId === characterId && fb.goal === currentGoal));
              localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updatedFeedbackHistory));
              console.log(`Removed ${allFeedback.length - updatedFeedbackHistory.length} feedback records for characterId=${characterId} and goal=${currentGoal}`);
          } catch (e) { console.error("清除相關回饋記錄時出錯:", e); alert("清除相關回饋記錄時發生錯誤。"); }
      }
  }

  // 發送訊息
  const handleSendMessage = async () => { if (!currentMessage.trim() || !selectedCharacter) return; if (!goal.trim()) { setError("請先設定本次聊天的目標！"); return; } if (isLoading || isGettingFeedback) return; const newUserMessage = { id: Date.now(), sender: 'user', text: currentMessage }; const currentInput = currentMessage; setMessages(prevMessages => [...prevMessages, newUserMessage]); setCurrentMessage(''); setIsLoading(true); setError(null); try { const historyForOllama = messages.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text })); const requestHistory = [...historyForOllama, { role: 'user', content: currentInput }]; const chatModel = process.env.REACT_APP_OLLAMA_CHAT_MODEL || 'llama3.2:latest'; const aiResponseText = await sendMessageToOllama(goal, requestHistory, selectedCharacter, chatModel); const newAiMessage = { id: Date.now() + 1, sender: 'ai', text: aiResponseText }; setMessages(prevMessages => [...prevMessages, newAiMessage]); } catch (err) { console.error("Error contacting Ollama:", err); const errorMsg = err.message || "與 AI 通訊時發生錯誤。"; setError(errorMsg); const errorAiMessage = { id: Date.now() + 1, sender: 'ai', text: `🤖 抱歉，處理時遇到問題：${errorMsg}` }; setMessages(prevMessages => [...prevMessages, errorAiMessage]); } finally { setIsLoading(false); } };

  // 回饋解析
  const parseFeedback = (feedbackText) => { let summary = "無法解析回饋摘要。"; let scores = { clarity: null, empathy: null, confidence: null, appropriateness: null, goalAchievement: null }; let summaryMatch = null; let summaryOnlyMatch = null; let scoresTextMatch = null; try { summaryMatch = feedbackText.match(/\[Feedback Summary\]\s*([\s\S]*?)\s*\[Scores\]/); if (summaryMatch && summaryMatch[1]) { summary = summaryMatch[1].trim(); } else { summaryOnlyMatch = feedbackText.match(/\[Feedback Summary\]\s*([\s\S]*)/); if (summaryOnlyMatch && summaryOnlyMatch[1]) { summary = summaryOnlyMatch[1].trim(); console.warn("Only found summary..."); } else { console.warn("Could not find [Feedback Summary] section."); summary = feedbackText; } } scoresTextMatch = feedbackText.match(/\[Scores\]\s*([\s\S]*)/); if (scoresTextMatch && scoresTextMatch[1]) { const scoreLines = scoresTextMatch[1].trim().split('\n'); scoreLines.forEach(line => { const parts = line.split(':'); if (parts.length === 2) { let key = parts[0].trim().toLowerCase().replace(/\s+/g, ''); if (key === 'goalachievement') key = 'goalAchievement'; const value = parts[1].trim(); if (Object.prototype.hasOwnProperty.call(scores, key)) { if (value.toLowerCase() === 'n/a') { scores[key] = null; } else { const score = parseInt(value, 10); if (!isNaN(score)) { scores[key] = Math.max(0, Math.min(100, score)); } else { console.warn(`Invalid score value "${value}" for key "${key}"`); scores[key] = null; } } } else { console.warn(`Unexpected score key "${key}" found.`); } } }); } else if (!summaryOnlyMatch && summaryMatch === null){ console.warn("Could not find [Scores] section..."); } } catch (e) { console.error("Error parsing feedback text:", e); summary = feedbackText; scores = { clarity: null, empathy: null, confidence: null, appropriateness: null, goalAchievement: null }; } console.log("Parsed Feedback:", { summary, scores }); return { summary, scores }; };

  // 獲取回饋並記錄上下文
  const handleGetFeedback = async () => {
      if (!selectedCharacter || !goal.trim() || messages.filter(m => m.sender === 'user').length === 0) { alert("請先設定目標、選擇角色並進行至少一輪對話 (包含你的發言)，才能請求回饋。"); return; }
      if (isLoading || isGettingFeedback) return;
      setIsGettingFeedback(true); setError(null); const feedbackRequestMessage = { id: Date.now(), sender: 'system', text: '⏳ 正在向 AI 請求對話回饋...' }; setMessages(prevMessages => [...prevMessages, feedbackRequestMessage]);
      try {
          const historyForFeedback = messages.filter(msg => msg.sender !== 'system').map(msg => ({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text }));
          // --- 獲取用戶訊息上下文 ---
          const userMessagesForContext = messages.filter(msg => msg.sender === 'user').slice(-3).map(msg => msg.text);
          const feedbackModel = process.env.REACT_APP_OLLAMA_FEEDBACK_MODEL || process.env.REACT_APP_OLLAMA_CHAT_MODEL || 'llama3.2:latest';
          const feedbackRawText = await getFeedbackFromOllama(goal, historyForFeedback, selectedCharacter, feedbackModel);
          const { summary, scores } = parseFeedback(feedbackRawText);
          // 聊天框中的回饋訊息（不顯示上下文）
          const feedbackMessage = { id: Date.now() + 1, sender: 'ai', isFeedback: true, text: `💡 **本次對話回饋 (${goal})**\n\n**摘要:**\n${summary}\n\n**評分 (0-100):**\n- 清晰度: ${scores.clarity ?? 'N/A'}\n- 同理心: ${scores.empathy ?? 'N/A'}\n- 自信: ${scores.confidence ?? 'N/A'}\n- 適當性: ${scores.appropriateness ?? 'N/A'}\n- 目標達成: ${scores.goalAchievement ?? 'N/A'}` };
          // 存儲到 localStorage 的數據（包含上下文）
          const newFeedbackEntry = { timestamp: Date.now(), goal: goal, characterId: selectedCharacter.id, characterName: selectedCharacter.name, scores: scores, summary: summary, userMessagesContext: userMessagesForContext, rawFeedback: feedbackRawText };
          const existingFeedback = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '[]');
          localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify([...existingFeedback, newFeedbackEntry]));
          setMessages(prevMessages => [...prevMessages.filter(msg => msg.id !== feedbackRequestMessage.id), feedbackMessage]);
      } catch (err) { console.error("Error getting or parsing feedback from Ollama:", err); const errorMsg = err.message || "無法獲取或處理 AI 回饋。"; setError(errorMsg); const errorFeedbackMessage = { id: Date.now() + 1, sender: 'ai', text: `🤖 抱歉，獲取回饋時遇到問題：${errorMsg}` }; setMessages(prevMessages => [...prevMessages.filter(msg => msg.id !== feedbackRequestMessage.id), errorFeedbackMessage]); }
      finally { setIsGettingFeedback(false); }
  };

  return (
    <Container fluid className="training-room-container p-0">
      {/* 頂部欄 */}
      <Row className="goal-input-row m-0 align-items-center">
        <Col md={7} className="mb-2 mb-md-0">
          <InputGroup>
            <InputGroup.Text>🎯</InputGroup.Text>
            <Form.Control type="text" placeholder="輸入本次社交訓練目標..." value={goal} onChange={(e) => setGoal(e.target.value)} disabled={isLoading || isGettingFeedback} aria-label="聊天目標"/>
          </InputGroup>
        </Col>
        <Col md={5} className="d-flex align-items-center justify-content-md-end">
          {characters && characters.length > 0 ? (
            <Dropdown className="me-3" id="character-selector-dropdown">
              <Dropdown.Toggle variant="outline-secondary" size="sm" id="dropdown-character-select-button" disabled={isLoading || isGettingFeedback} style={{minWidth: '120px', textAlign: 'left'}}>
                與: {selectedCharacter ? <strong className="text-primary">{selectedCharacter.name}</strong> : '選擇角色'}
              </Dropdown.Toggle>
              <Dropdown.Menu style={{maxHeight: '300px', overflowY: 'auto'}}>
                {characters.map(character => ( <Dropdown.Item key={character.id} active={selectedCharacter?.id === character.id} onClick={() => onSelectCharacter(character)} disabled={selectedCharacter?.id === character.id}> {character.name} </Dropdown.Item> ))}
                 <Dropdown.Divider />
                 <Dropdown.Item onClick={() => setActiveView && setActiveView('characters')}> <small className="text-muted"> <i className="bi bi-gear me-1"></i> 管理角色... </small> </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
           ) : ( <span className="text-danger me-3 small">請先至角色館新增角色</span> )}
          {selectedCharacter && goal.trim() && messages.length > 0 && ( <Button variant="outline-danger" size="sm" onClick={handleClearChat} disabled={isLoading || isGettingFeedback} title={`清除與 ${selectedCharacter.name} 關於目標 "${goal}" 的聊天記錄`}> <i className="bi bi-trash3"></i> </Button> )}
        </Col>
        {error && ( <Col xs={12} className="mt-2"><Alert variant="danger" onClose={() => setError(null)} dismissible className="py-1 px-2 small mb-0">{error}</Alert></Col> )}
        {(!selectedCharacter || !goal.trim()) && messages.length === 0 && !error && ( <Col xs={12} className="mt-2"><Alert variant="info" className="text-center small p-2 mb-0"> 請先選擇角色並設定目標，然後開始對話！ </Alert></Col> )}
      </Row>

      {/* 聊天顯示區域 */}
      <Row className="chat-display-row m-0">
        <Col className="p-0"> <ChatDisplay messages={messages} isLoading={isLoading} /> </Col>
      </Row>

      {/* 訊息輸入區域 */}
      <Row className="message-input-row m-0">
        <Col> <MessageInput currentMessage={currentMessage} onMessageChange={setCurrentMessage} onSendMessage={handleSendMessage} onGetFeedback={handleGetFeedback} isLoading={isLoading} isGettingFeedback={isGettingFeedback} disabled={!selectedCharacter || !goal.trim() || isLoading || isGettingFeedback}/> </Col>
      </Row>
    </Container>
  );
}
export default TrainingRoom;