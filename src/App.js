// src/App.js (完整版 - 包含傳遞 setActiveView)

import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import AppNavbar from './components/common/AppNavbar';
import TrainingRoom from './components/TrainingRoom/TrainingRoom';
import CharacterHall from './components/CharacterHall/CharacterHall';
import FeedbackWall from './components/FeedbackWall/FeedbackWall';
import './styles/App.css';

const CHARACTERS_STORAGE_KEY = 'wingchat_characters';
const FEEDBACK_STORAGE_KEY = 'wingchat_feedback';

function App() {
  const [activeView, setActiveView] = useState('training');
  const [characters, setCharacters] = useState(() => {
    const savedCharacters = localStorage.getItem(CHARACTERS_STORAGE_KEY);
    if (savedCharacters) {
      try {
        const parsed = JSON.parse(savedCharacters);
        if (Array.isArray(parsed) && parsed.length > 0) {
            if (!parsed.find(c => c.id === 'default')) {
                 return [{ id: 'default', name: '預設助手', description: '...' }, ...parsed];
            }
            return parsed;
        }
      } catch (e) { console.error("Failed to parse characters", e); }
    }
    return [{ id: 'default', name: '預設助手', description: '我是 WingChat，一個友善且樂於助人的 AI 社交教練。' }];
  });
  const [selectedCharacter, setSelectedCharacter] = useState(characters[0]);

  useEffect(() => {
    localStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(characters));
  }, [characters]);

  const handleUpdateCharacters = (newCharacters) => {
    setCharacters(newCharacters);
    if (selectedCharacter && !newCharacters.find(c => c.id === selectedCharacter.id)) {
      setSelectedCharacter(newCharacters.length > 0 ? newCharacters[0] : null);
    } else if (!selectedCharacter && newCharacters.length > 0) {
        setSelectedCharacter(newCharacters[0]);
    }
    if (newCharacters.length === 0) {
        const defaultChar = { id: 'default', name: '預設助手', description: '我是 WingChat...' };
        setCharacters([defaultChar]);
        setSelectedCharacter(defaultChar);
    }
  };

  const handleSelectCharacter = (character) => {
    if (character) {
        setSelectedCharacter(character);
        if (activeView !== 'training') {
          setActiveView('training');
        }
    } else {
        console.warn("Attempted to select a null character.");
        setSelectedCharacter(characters.find(c => c.id === 'default') || (characters.length > 0 ? characters[0] : null)); // 回退到預設或第一個
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'characters':
        return <CharacterHall
                  characters={characters}
                  onUpdateCharacters={handleUpdateCharacters}
                  onSelectCharacter={handleSelectCharacter}
                />;
      case 'feedback':
        return <FeedbackWall />;
      case 'training':
      default:
        return <TrainingRoom
                  characters={characters}
                  selectedCharacter={selectedCharacter}
                  onSelectCharacter={handleSelectCharacter}
                  // --- 添加 setActiveView prop ---
                  setActiveView={setActiveView} // <<<--- 傳遞切換視圖函數
               />;
    }
  };

  return (
    <div className="app-container">
      <AppNavbar onSelectView={setActiveView} currentView={activeView} />
      <Container fluid className={`main-content ${activeView === 'training' ? 'no-scroll p-0' : 'p-3'} d-flex flex-column`}>
        {renderView()}
      </Container>
    </div>
  );
}

export default App;