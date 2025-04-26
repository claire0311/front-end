// src/components/CharacterHall/AddCharacterModal.js (支持新增和編輯)

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

// --- 接收新的 props ---
function AddCharacterModal({ show, onHide, onSaveCharacterRequest, initialData }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [validated, setValidated] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // 判斷是否為編輯模式
  const isEditing = !!initialData;

  // 當 Modal 顯示或初始數據變化時，填充表單
  useEffect(() => {
    if (show) {
      if (isEditing) {
        setName(initialData.name);
        setDescription(initialData.description);
      } else {
        setName('');
        setDescription('');
      }
      setValidated(false);
      setErrorMsg(null);
    }
  }, [show, initialData, isEditing]); // 依賴 initialData 和 isEditing

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    setErrorMsg(null);

    if (form.checkValidity() === false) {
      setValidated(true);
    } else {
      // 調用 CharacterHall 傳來的保存函數 (處理新增或更新)
      const result = onSaveCharacterRequest({ name, description }); // <<<--- 調用新的 prop 函數

      if (result.success) {
        onHide(); // 成功則關閉 Modal
      } else {
        // 失敗 (名稱重複)，顯示錯誤訊息
        setErrorMsg(result.error || '保存角色時發生未知錯誤。');
        setValidated(false);
      }
    }
  };

  const handleClose = () => {
    onHide();
  }

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton>
        {/* --- 根據模式顯示不同標題 --- */}
        <Modal.Title>{isEditing ? '編輯 AI 角色' : '新增 AI 角色'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="characterName">
            <Form.Label>角色名稱 <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              placeholder="例如：面試官、健談的鄰居"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={50}
              isInvalid={!!errorMsg || (validated && !name.trim())}
            />
            <Form.Control.Feedback type="invalid">
              {errorMsg ? errorMsg : '請輸入角色名稱 (最多 50 字)。'}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="characterDescription">
            <Form.Label>角色描述 (AI 將依此扮演) <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="請詳細描述角色的性格、背景、語氣和行為方式..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={500}
            />
             <Form.Text className="text-muted">
               描述越詳細，AI 扮演得越像。 (最多 500 字)
             </Form.Text>
            <Form.Control.Feedback type="invalid">
              請輸入角色描述。
            </Form.Control.Feedback>
          </Form.Group>
          <div className="d-flex justify-content-end">
             <Button variant="secondary" onClick={handleClose} className="me-2">
               取消
             </Button>
             {/* --- 根據模式顯示不同按鈕文字 --- */}
             <Button variant="primary" type="submit">
               {isEditing ? '更新角色' : '儲存角色'}
             </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default AddCharacterModal;