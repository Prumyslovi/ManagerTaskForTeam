import React, { useState, useEffect } from 'react';
import { fetchDocuments } from '../../services/documentApi';
import CreateDocument from './CreateDocument';
import DocumentEditor from './DocumentEditor';
import './DocumentStyle.css';

const DocumentList = ({ teamId }) => {
  const [showCreateDocument, setShowCreateDocument] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedDocuments = await fetchDocuments(teamId);
      console.log('Полученные документы:', fetchedDocuments);
      setDocuments(fetchedDocuments);
    } catch (err) {
      setError('Не удалось загрузить документы. Попробуйте позже.');
      console.error('Ошибка при загрузке документов:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) {
      loadDocuments();
    }
  }, [teamId]);

  const handleClose = () => {
    setShowCreateDocument(false);
    setSelectedDocumentId(null);
    loadDocuments();
  };

  if (loading) {
    return <div>Загрузка документов...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="document-list">
      {!showCreateDocument && !selectedDocumentId && (
        <button
          onClick={() => setShowCreateDocument(true)}
          className="create-document-button"
        >
          Создать документ
        </button>
      )}

      {!showCreateDocument && !selectedDocumentId && (
        <>
          {documents.length === 0 ? (
            <div>Документы отсутствуют.</div>
          ) : (
            <div className="document-grid">
              {documents.map((doc) => {
                const createdAt = new Date(doc.createdAt).toLocaleString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                });
                const creatorName = doc.createdByMember
                  ? `${doc.createdByMember.firstName} ${doc.createdByMember.lastName}`
                  : doc.createdBy;

                return (
                  <div
                    key={doc.documentId}
                    onClick={() => {
                      console.log('Выбран документ с ID:', doc.documentId);
                      setSelectedDocumentId(doc.documentId);
                    }}
                    className="document-item"
                  >
                    <div className="document-content">
                      <span className="document-title">{doc.title}</span>
                      <span className="document-date">{createdAt}</span>
                      <span className="document-creator">{creatorName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {showCreateDocument && (
        <CreateDocument teamId={teamId} onClose={handleClose} />
      )}

      {selectedDocumentId && (
        <DocumentEditor
          teamId={teamId}
          documentId={selectedDocumentId}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export default DocumentList;