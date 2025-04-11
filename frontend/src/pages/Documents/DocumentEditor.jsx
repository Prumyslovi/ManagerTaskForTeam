import React, { useState, useEffect, useRef } from 'react';
import { fetchDocumentContent, updateDocument } from '../../services/documentApi';
import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import Toolbar from './Toolbar';
import './DocumentStyle.css';
import '../styles/Message.css';
import '../styles/Spinner.css';
import { FaSpinner } from 'react-icons/fa';

const DocumentEditor = ({ teamId, documentId, onClose }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState('1.15');
  const [paragraphSpacing, setParagraphSpacing] = useState('0');
  const [contextMenu, setContextMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const editorRef = useRef(null);
  const connectionRef = useRef(null);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl('http://localhost:5062/documentHub', { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    const startConnection = async () => {
      try {
        await connection.start();
        console.log('Connected to SignalR');
        if (connection.state === HubConnectionState.Connected) {
          await connection.invoke('JoinDocument', documentId);
        } else {
          console.error('Cannot invoke JoinDocument: Connection is not in Connected state');
        }
      } catch (err) {
        console.error('SignalR Connection Error:', err);
      }
    };

    setIsLoading(true);
    startConnection();

    if (documentId) {
      console.log('Загрузка содержимого документа с ID:', documentId);
      fetchDocumentContent(documentId)
        .then((data) => {
          console.log('Полученные данные документа:', data);
          setContent(data.content || '');
          setTitle(data.title || '');
          if (editorRef.current) {
            editorRef.current.innerHTML = data.content || '';
          }
        })
        .catch((err) => {
          console.error('Детали ошибки при загрузке документа:', err.response || err);
          setMessage({ type: 'error', text: `Ошибка при загрузке документа: ${err.response?.status || 'Неизвестная ошибка'}. Проверьте ID документа или сервер.` });
        })
        .finally(() => setIsLoading(false));
    } else {
      setMessage({ type: 'error', text: 'ID документа не указан.' });
      setIsLoading(false);
    }

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

    return () => {
      document.removeEventListener('selectionchange', updateToolbar);
      if (connectionRef.current) {
        if (connectionRef.current.state === HubConnectionState.Connected) {
          connectionRef.current.invoke('LeaveDocument', documentId)
            .catch((err) => console.error('Error leaving document:', err));
        }
        connectionRef.current.stop();
      }
    };
  }, [documentId]);

  const handleSave = () => {
    setIsLoading(true);
    setMessage(null);
    const payload = {
      content: editorRef.current.innerHTML,
      memberId: localStorage.getItem('userId') || 'B8735544-1DD9-4C71-90C8-FBF8D70D2F01',
      changeDescription: JSON.stringify({ timestamp: Date.now(), updated: 'content' }),
    };
    updateDocument(documentId, payload)
      .then(() => {
        setMessage({ type: 'success', text: 'Документ успешно обновлен!' });
        if (connectionRef.current && connectionRef.current.state === HubConnectionState.Connected) {
          connectionRef.current.invoke('ReceiveUpdate', documentId, payload.content, payload.memberId);
        }
        setTimeout(() => onClose(), 1500);
      })
      .catch((err) => {
        setMessage({ type: 'error', text: 'Ошибка при обновлении документа.' });
        console.error('Ошибка при обновлении документа:', err);
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

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY });
  };

  const closeContextMenu = () => setContextMenu(null);

  const pasteAsPlainText = () => {
    navigator.clipboard.readText().then((text) => {
      document.execCommand('insertText', false, text);
      setContent(editorRef.current.innerHTML);
    });
    closeContextMenu();
  };

  const pasteWithStyle = () => {
    navigator.clipboard.readText().then((text) => {
      const span = document.createElement('span');
      span.style.fontFamily = fontFamily;
      span.style.fontSize = `${fontSize}px`;
      span.innerText = text;
      document.execCommand('insertHTML', false, span.outerHTML);
      setContent(editorRef.current.innerHTML);
    });
    closeContextMenu();
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
          handleSave={handleSave}
        />
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Название документа"
        className="title-input"
      />
      <div
        ref={editorRef}
        contentEditable
        onInput={() => setContent(editorRef.current.innerHTML)}
        onContextMenu={handleContextMenu}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              const p = document.createElement('p');
              p.style.fontFamily = fontFamily;
              p.style.fontSize = `${fontSize}px`;
              p.style.lineHeight = lineHeight;
              p.style.marginBottom = `${paragraphSpacing}px`;
              p.innerHTML = '<br>';
              range.insertNode(p);
              range.setStart(p, 0);
              range.setEnd(p, 0);
              e.preventDefault();
            }
          }
        }}
        className="editor"
      />
      {contextMenu && (
        <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
          <button onClick={pasteAsPlainText} className="context-menu-button">
            Вставить как обычный текст
          </button>
          <button onClick={pasteWithStyle} className="context-menu-button">
            Вставить с текущим стилем
          </button>
        </div>
      )}
      {isLoading && <FaSpinner className="spinner" />}
    </div>
  );
};

export default DocumentEditor;