// src/components/CharacterHall/CharacterHall.js (確保固定頭部結構)

import React, { useState } from 'react';
// 導入 Container, Row, Col, Card, Button, BootstrapAlert, ButtonGroup
import { Button, Row, Col, Card, Alert as BootstrapAlert, Container, ButtonGroup } from 'react-bootstrap';
import AddCharacterModal from './AddCharacterModal';
import CharacterEvalModal from './CharacterEvalModal';
// 導入對應的 CSS 文件
import './CharacterHall.css'; // <<<--- 確保導入了 CharacterHall 的 CSS

// 本地儲存的 Key (最好從共享文件導入或定義在更高層)
const FEEDBACK_STORAGE_KEY = 'wingchat_feedback';

function CharacterHall({ characters, onUpdateCharacters, onSelectCharacter }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [evaluatingCharacter, setEvaluatingCharacter] = useState(null);

  // --- 函數定義 ---
  const handleShowAddModal = () => { setEditingCharacter(null); setShowAddModal(true); }
  const handleShowEditModal = (character) => { setEditingCharacter(character); setShowAddModal(true); }
  const handleHideAddModal = () => { setShowAddModal(false); setEditingCharacter(null); }
  const handleShowEvalModal = (character) => { setEvaluatingCharacter(character); setShowEvalModal(true); }
  const handleHideEvalModal = () => { setShowEvalModal(false); setEvaluatingCharacter(null); }

  // 處理新增或更新請求 (包含同步更新回饋名稱)
  const handleSaveCharacterRequest = (characterData) => {
    const trimmedName = characterData.name.trim();
    const isDuplicate = characters.some(
      (c) => c.id !== editingCharacter?.id &&
             c.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      return { success: false, error: `角色名稱 "${trimmedName}" 已經存在，請修改。` };
    }

    let characterIdToUpdateFeedback = null; // 用於下面同步回饋

    if (editingCharacter) {
      // 更新邏輯
      characterIdToUpdateFeedback = editingCharacter.id; // 保存 ID
      const updatedCharacters = characters.map(c =>
        c.id === editingCharacter.id ? { ...c, name: trimmedName, description: characterData.description } : c
      );
      onUpdateCharacters(updatedCharacters);
      console.log("角色更新成功");
    } else {
      // 新增邏輯
      const newId = `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const characterWithId = { ...characterData, name: trimmedName, id: newId };
      const updatedCharacters = [...characters, characterWithId];
      onUpdateCharacters(updatedCharacters);
      console.log("角色新增成功");
      // 新增的角色不需要更新回饋名稱
    }

    // --- 如果是編輯，同步更新回饋記錄名稱 ---
    if (characterIdToUpdateFeedback) {
        try {
            const savedFeedback = localStorage.getItem(FEEDBACK_STORAGE_KEY);
            let allFeedback = [];
            if (savedFeedback) { allFeedback = JSON.parse(savedFeedback); if (!Array.isArray(allFeedback)) allFeedback = []; }
            const updatedFeedbackHistory = allFeedback.map(fb => {
              if (fb.characterId === characterIdToUpdateFeedback) {
                return { ...fb, characterName: trimmedName };
              }
              return fb;
            });
            localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updatedFeedbackHistory));
            console.log(`已同步更新 ${updatedFeedbackHistory.filter(fb => fb.characterId === characterIdToUpdateFeedback).length} 筆相關回饋記錄的角色名稱。`);
        } catch (e) { console.error("同步更新回饋記錄名稱時出錯:", e); }
    }
    // --- 結束同步更新 ---

    return { success: true }; // 無論新增或更新成功都返回 true
  };

  // 刪除角色邏輯
  const handleDeleteCharacter = (idToDelete) => {
    if (idToDelete === 'default') { alert("無法刪除預設助手角色。"); return; }
    const characterToDelete = characters.find(c => c.id === idToDelete);
    if (characterToDelete && window.confirm(`確定要刪除角色 "${characterToDelete.name}" 嗎？`)) {
       const updatedCharacters = characters.filter(c => c.id !== idToDelete);
       onUpdateCharacters(updatedCharacters);
       // --- 可選：同時刪除與此角色相關的所有回饋 ---
       // try {
       //   const savedFeedback = localStorage.getItem(FEEDBACK_STORAGE_KEY);
       //   let allFeedback = [];
       //   if (savedFeedback) { allFeedback = JSON.parse(savedFeedback); if (!Array.isArray(allFeedback)) allFeedback = []; }
       //   const updatedFeedbackHistory = allFeedback.filter(fb => fb.characterId !== idToDelete);
       //   localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updatedFeedbackHistory));
       //   console.log(`已同步刪除所有與角色 ${idToDelete} 相關的回饋記錄。`);
       // } catch (e) { console.error("同步刪除回饋記錄時出錯:", e); }
    }
  };


  return (
    // --- 使用 Container 包裹，並應用 CSS class ---
    <Container fluid className="character-hall-container p-0 d-flex flex-column">

      {/* ======================================== */}
      {/* =====   固定的頭部區域 Start         ===== */}
      {/* ======================================== */}
      <div className="character-hall-header bg-light p-3 shadow-sm">
        <h2 className="mb-2">角色館</h2>
        <p className="text-muted mb-3">在這裡新增、管理你想互動練習的 AI 角色。選擇一個角色後，點擊「開始訓練」即可進入訓練室。</p>
        <Button variant="primary" onClick={handleShowAddModal}>
          <i className="bi bi-plus-lg me-2"></i>新增角色
        </Button>
      </div>
      {/* ======================================== */}
      {/* =====    固定的頭部區域 End          ===== */}
      {/* ======================================== */}


      {/* ======================================== */}
      {/* ===== 可滾動的角色卡片區域 Start     ===== */}
      {/* ======================================== */}
      <div className="character-hall-body p-4">
        {/* 無自訂角色提示 */}
        {characters.filter(c => c.id !== 'default').length === 0 && (
          <BootstrapAlert variant="info">目前沒有任何自訂角色，快新增一個吧！</BootstrapAlert>
        )}

        <Row xs={1} md={2} lg={3} xl={4} className="g-4">
          {characters.map((character) => (
            <Col key={character.id}>
              <Card className="h-100 shadow-sm character-card">
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{character.name}</Card.Title>
                  <Card.Text className="text-muted small flex-grow-1 character-description">
                    {character.description}
                  </Card.Text>
                  <div className="mt-auto d-flex justify-content-between align-items-center pt-2">
                    <Button variant="success" size="sm" onClick={() => onSelectCharacter(character)} title="選擇此角色並開始訓練" className="me-1"> <i className="bi bi-chat-dots-fill me-1"></i> 訓練 </Button>
                    <ButtonGroup size="sm">
                      <Button variant="outline-info" onClick={() => handleShowEvalModal(character)} title="查看對話評估"> <i className="bi bi-graph-up"></i> </Button>
                      {character.id !== 'default' && (
                        <>
                          <Button variant="outline-secondary" onClick={() => handleShowEditModal(character)} title="編輯此角色"> <i className="bi bi-pencil-square"></i> </Button>
                          <Button variant="outline-danger" onClick={() => handleDeleteCharacter(character.id)} title="刪除此角色"> <i className="bi bi-trash3"></i> </Button>
                        </>
                      )}
                    </ButtonGroup>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      {/* ======================================== */}
      {/* =====  可滾動的角色卡片區域 End      ===== */}
      {/* ======================================== */}


      {/* 新增/編輯 Modal */}
      <AddCharacterModal
        show={showAddModal}
        onHide={handleHideAddModal}
        onSaveCharacterRequest={handleSaveCharacterRequest} // 傳遞合併後的保存函數
        initialData={editingCharacter}
      />

      {/* 評估 Modal */}
      {evaluatingCharacter && (
          <CharacterEvalModal
            show={showEvalModal}
            onHide={handleHideEvalModal}
            character={evaluatingCharacter}
            // onDeleteFeedback 不再需要傳遞，由 Modal 內部處理
          />
      )}

    </Container>
  );
}

export default CharacterHall;