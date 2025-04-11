import React, { useState, useRef, useEffect } from 'react';
import { createDocument } from '../../services/documentApi';
import Toolbar from './Toolbar';
import './DocumentStyle.css';
import '../styles/Message.css';
import '../styles/Spinner.css';
import { FaSpinner } from 'react-icons/fa';

const CreateDocument = ({ teamId, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(16);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    const updateToolbar = () => {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let node = range.startContainer;
        if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
        if (node && editorRef.current && editorRef.current.contains(node)) {
          const computedStyle = window.getComputedStyle(node);
          setFontSize(parseInt(computedStyle.fontSize) || 16);
          setFontFamily(computedStyle.fontFamily.replace(/['"]/g, '').split(',')[0]);
        }
      }
    };
    document.addEventListener('selectionchange', updateToolbar);
    return () => document.removeEventListener('selectionchange', updateToolbar);
  }, []);

  const handleSubmit = () => {
    setIsLoading(true);
    setMessage(null);
    const documentData = {
      teamId,
      title,
      content: editorRef.current.innerHTML,
      createdBy: localStorage.getItem('userId') || 'B8735544-1DD9-4C71-90C8-FBF8D70D2F01',
    };
    createDocument(documentData)
      .then(() => {
        setMessage({ type: 'success', text: 'Документ успешно создан!' });
        setTimeout(() => onClose(), 1500);
      })
      .catch((err) => {
        setMessage({ type: 'error', text: 'Ошибка при создании документа.' });
        console.error('Ошибка при создании документа:', err);
      })
      .finally(() => setIsLoading(false));
  };

  const applyStyle = (style, value) => {
    if (style === 'fontSize') {
      document.execCommand('fontSize', false, '4');
      const fontElements = editorRef.current.querySelectorAll('font[size]');
      fontElements.forEach((el) => {
        el.removeAttribute('size');
        el.style.fontSize = `${value}px`;
      });
    } else if (style === 'fontFamily') {
      document.execCommand('fontName', false, value);
    } else {
      document.execCommand(style, false, value);
    }
    setContent(editorRef.current.innerHTML);
  };

  const applyAlignment = (alignment) => {
    const command = alignment === 'justify' ? 'justifyFull' : `justify${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`;
    document.execCommand(command, false, null);
    setContent(editorRef.current.innerHTML);
  };

  const applyList = (type, listStyleType) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let node = range.startContainer;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
      while (node && node !== editorRef.current) {
        if (node.tagName === 'UL' && type === 'bullet') {
          node.style.listStyleType = listStyleType;
          setContent(editorRef.current.innerHTML);
          return;
        } else if (node.tagName === 'OL' && type === 'number') {
          node.style.listStyleType = listStyleType;
          setContent(editorRef.current.innerHTML);
          return;
        }
        node = node.parentNode;
      }
    }
    const command = type === 'bullet' ? 'insertUnorderedList' : 'insertOrderedList';
    document.execCommand(command, false, null);
    const list = editorRef.current.querySelector(type === 'bullet' ? 'ul' : 'ol');
    if (list) list.style.listStyleType = listStyleType;
    setContent(editorRef.current.innerHTML);
  };

  const handleInput = () => {
    setContent(editorRef.current.innerHTML);
  };

  return (
    <div className="editor-container">
      {message && (
        <div className={message.type === 'success' ? 'right-content' : 'restricted-content'}>
          {message.text}
        </div>
      )}
      <button onClick={onClose} className="exit-button">
        ✕
      </button>
      <div className="toolbar-wrapper">
        <Toolbar
          applyStyle={applyStyle}
          applyAlignment={applyAlignment}
          applyList={applyList}
          setFontSize={setFontSize}
          fontSize={fontSize}
          setFontFamily={setFontFamily}
          fontFamily={fontFamily}
          handleSave={handleSubmit}
        />
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Название документа"
        className="title-input"
      />
      <div ref={editorRef} contentEditable onInput={handleInput} className="editor" />
      {isLoading && <FaSpinner className="spinner" />}
    </div>
  );
};

export default CreateDocument;