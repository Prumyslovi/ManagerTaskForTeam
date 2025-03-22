import React, { useState } from 'react';
import CreateDocument from './CreateDocument';
import DocumentEditor from './DocumentEditor';
import './DocumentStyle.css';

const DocumentList = ({ teamId }) => {
  const [showCreateDocument, setShowCreateDocument] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  // Пример списка документов (замените на данные из API, если нужно)
  const documents = [
    { id: 'doc1', title: 'Документ 1' },
    { id: 'doc2', title: 'Документ 2' },
  ];

  return (
    <div className="document-list">
      {/* Кнопка для создания документа */}
      {!showCreateDocument && !selectedDocumentId && (
        <button
          onClick={() => setShowCreateDocument(true)}
          className="create-document-button"
        >
          Создать документ
        </button>
      )}

      {/* Список документов */}
      {!showCreateDocument && !selectedDocumentId && (
        <div className="document-grid">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDocumentId(doc.id)}
              className="document-item"
            >
              <div className="document-content">
                <span className="document-title">{doc.title}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Отображение CreateDocument */}
      {showCreateDocument && (
        <CreateDocument
          teamId={teamId}
          onBack={() => setShowCreateDocument(false)}
        />
      )}

      {/* Отображение DocumentEditor */}
      {selectedDocumentId && (
        <DocumentEditor
          teamId={teamId}
          documentId={selectedDocumentId}
          onBack={() => setSelectedDocumentId(null)}
        />
      )}
    </div>
  );
};

export default DocumentList;