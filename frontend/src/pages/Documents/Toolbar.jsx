import React, { useState } from 'react';
import './DocumentStyle.css';

const Toolbar = ({
  applyStyle,
  applyAlignment,
  applyList,
  setFontSize,
  fontSize,
  setFontFamily,
  fontFamily,
  setTextColor,
  setBackgroundColor,
  handleSave,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(null); // Для управления видимостью палитры цветов
  const [listType, setListType] = useState({ bullet: 'disc', number: 'decimal' }); // Стили списков

  const handleFontSizeChange = (delta) => {
    const newSize = Math.max(8, parseInt(fontSize) + delta);
    setFontSize(newSize);
    applyStyle('fontSize', newSize);
  };

  const handleColorChange = (type, color) => {
    if (type === 'text') {
      setTextColor(color);
      applyStyle('foreColor', color);
    } else if (type === 'background') {
      setBackgroundColor(color);
      applyStyle('hiliteColor', color);
    }
    setShowColorPicker(null);
  };

  const applyListWithStyle = (type) => {
    const style = type === 'bullet' ? listType.bullet : listType.number;
    applyList(type, style);
  };

  return (
    <div className="toolbar">
      <select
        value={fontFamily}
        onChange={(e) => setFontFamily(e.target.value) || applyStyle('fontFamily', e.target.value)}
        className="toolbar-select"
      >
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Courier New">Courier New</option>
        <option value="Calibri">Calibri</option>
        <option value="Roboto">Roboto</option>
        <option value="Verdana">Verdana</option>
        <option value="Georgia">Georgia</option>
      </select>

      <button onClick={() => handleFontSizeChange(-1)} className="toolbar-button">-</button>
      <input type="number" value={fontSize} readOnly className="toolbar-input" />
      <button onClick={() => handleFontSizeChange(1)} className="toolbar-button">+</button>

      <button onClick={() => applyStyle('bold')} className="toolbar-button">B</button>
      <button onClick={() => applyStyle('italic')} className="toolbar-button">I</button>
      <button onClick={() => applyStyle('underline')} className="toolbar-button">U</button>

      <button
        onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')}
        className="toolbar-button"
      >
        A
      </button>

      <button onClick={() => applyAlignment('left')} className="toolbar-button" title="Выравнивание по левому краю">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D334A" strokeWidth="2">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="14" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>
      <button onClick={() => applyAlignment('center')} className="toolbar-button" title="Выравнивание по центру">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D334A" strokeWidth="2">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>
      <button onClick={() => applyAlignment('right')} className="toolbar-button" title="Выравнивание по правому краю">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D334A" strokeWidth="2">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="10" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>
      <button onClick={() => applyAlignment('justify')} className="toolbar-button" title="Выравнивание по ширине">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D334A" strokeWidth="2">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>

      <select
        onChange={(e) => setListType({ ...listType, bullet: e.target.value })}
        className="toolbar-select"
      >
        <option value="disc">•</option>
        <option value="circle">○</option>
        <option value="square">■</option>
      </select>
      <button onClick={() => applyListWithStyle('bullet')} className="toolbar-button">•</button>

      <select
        onChange={(e) => setListType({ ...listType, number: e.target.value })}
        className="toolbar-select"
      >
        <option value="decimal">1.</option>
        <option value="lower-alpha">a.</option>
        <option value="upper-alpha">A.</option>
        <option value="lower-roman">i.</option>
        <option value="upper-roman">I.</option>
      </select>
      <button onClick={() => applyListWithStyle('number')} className="toolbar-button">1.</button>

      <button onClick={handleSave} className="toolbar-button">Сохранить</button>
    </div>
  );
};

export default Toolbar;