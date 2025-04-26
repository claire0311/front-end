// src/components/TrainingRoom/ChatDisplay.js (修正版)

import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import ChatMessage from './ChatMessage';

function ChatDisplay({ messages, isLoading }) {
  const chatEndRef = useRef(null);
  const scrollContainerRef = useRef(null); // Ref 指向 .chat-display-area
  const prevMessagesLengthRef = useRef(messages.length);

  // useLayoutEffect 用於在新消息來時智能滾動
  useLayoutEffect(() => {
    // *** 獲取父元素 (.chat-display-row) 來檢查和控制滾動 ***
    const scrollableElement = scrollContainerRef.current?.parentElement;
    if (!scrollableElement) return;

    const isScrollable = scrollableElement.scrollHeight > scrollableElement.clientHeight;
    const messagesWereAdded = messages.length > prevMessagesLengthRef.current;
    const scrollThreshold = 100; // 接近底部的容錯像素
    let isNearBottom = true;

    if (isScrollable) {
      isNearBottom = scrollableElement.scrollHeight - scrollableElement.scrollTop <= scrollableElement.clientHeight + scrollThreshold;
    }

    // 只有當新訊息加入且用戶接近底部時才滾動
    if (messagesWereAdded && isNearBottom) {
      const timer = setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 50); // 短延遲確保渲染完成
      return () => clearTimeout(timer);
    }

    // 更新上次訊息數量
    prevMessagesLengthRef.current = messages.length;

  }, [messages]); // 依賴 messages 陣列

  return (
    // *** 這個 div (chat-display-area) 不再設置 height 或 overflow ***
    <div
      ref={scrollContainerRef} // Ref 仍然指向這個 div
      className="chat-display-area"
    >
      {/* 空狀態提示 */}
      {messages.length === 0 && !isLoading && (
        <Alert variant="info" className="text-center small p-2 mx-auto mt-2" style={{maxWidth: '80%', flexShrink: 0 }}>
          設定好目標後，就可以開始和 AI 對話練習囉！
        </Alert>
      )}

      {/* 訊息列表 */}
      {messages.map((msg) => (
        // 傳遞 isFeedback prop
        <ChatMessage key={msg.id} sender={msg.sender} text={msg.text} isFeedback={msg.isFeedback} />
      ))}

      {/* 加載指示器 */}
      {isLoading && (
         <div className="d-flex justify-content-center align-items-center my-2 p-2 text-muted" style={{ flexShrink: 0 }}>
           <Spinner animation="border" role="status" size="sm" className="me-2">
             <span className="visually-hidden">Loading...</span>
           </Spinner>
           AI 正在思考...
         </div>
       )}

      {/* 滾動目標錨點 */}
      <div ref={chatEndRef} style={{ height: '1px', flexShrink: 0 }} />
    </div>
  );
}

export default ChatDisplay;