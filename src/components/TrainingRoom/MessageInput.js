// src/components/TrainingRoom/MessageInput.js (調整對齊)

import React, { useRef } from 'react';
import { Form, Button, InputGroup, Spinner } from 'react-bootstrap';

function MessageInput({
    currentMessage,
    onMessageChange,
    onSendMessage,
    onGetFeedback,
    isLoading,
    isGettingFeedback,
    disabled
}) {
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && !isGettingFeedback && !disabled && currentMessage.trim()) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleSendClick = () => {
      if (!isLoading && !isGettingFeedback && !disabled && currentMessage.trim()) {
          onSendMessage();
      }
  }

  const handleFeedbackClick = () => {
      if (!isLoading && !isGettingFeedback && !disabled) {
          onGetFeedback();
      }
  }

  return (
    // --- 使用 align-items-center 確保垂直居中 ---
    <InputGroup className="message-input-group align-items-center">
      {/* 快速回饋按鈕 */}
      <Button
        variant="outline-info"
        onClick={handleFeedbackClick}
        disabled={isLoading || isGettingFeedback || disabled}
        title="讓 AI 針對本次對話給出回饋"
        className="feedback-button flex-shrink-0" // 添加 class
        style={{ height: '40px' }} // 設置固定高度
      >
        {isGettingFeedback ? ( <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> ) : ( "🤔 我說得如何？" )}
      </Button>

      {/* 文字輸入框 */}
      <Form.Control
        ref={textareaRef}
        as="textarea"
        rows={1} // <<<--- 初始行數設為 1，讓它根據內容和 min-height/max-height 伸縮
        placeholder={disabled ? "請先設定目標並選擇角色..." : "輸入訊息 (Shift+Enter 換行)..."}
        value={currentMessage}
        onChange={(e) => onMessageChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading || isGettingFeedback || disabled}
        className="message-textarea flex-grow-1 mx-2" // 使用 flex-grow 並添加左右邊距
        style={{
            resize: 'none',
            overflowY: 'auto', // 超出 max-height 時滾動
            minHeight: '40px', // <<<--- 設置最小高度，與按鈕對齊
            maxHeight: '100px', // <<<--- 限制最大高度，避免無限增長
            lineHeight: '1.5' // 可以調整行高影響垂直居中
        }}
        aria-label="訊息輸入框"
      />

      {/* 發送按鈕 */}
      <Button
        variant="primary"
        onClick={handleSendClick}
        disabled={isLoading || isGettingFeedback || disabled || !currentMessage.trim()}
        className="send-button flex-shrink-0" // 添加 class
        style={{ width: '40px', height: '40px' }} // 固定大小
      >
        {isLoading ? ( <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/> ) : ( <i className="bi bi-send"></i> )}
      </Button>
    </InputGroup>
  );
}

export default MessageInput;