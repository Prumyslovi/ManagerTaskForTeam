using ManagerTaskForTeam.Application.Interfaces.Repositories;
using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly IDocumentRepository _documentRepository;

        public DocumentService(IDocumentRepository documentRepository)
        {
            _documentRepository = documentRepository;
        }

        public async Task<IEnumerable<Document>> GetAllDocumentsAsync(Guid teamId)
        {
            var documents = await _documentRepository.GetAllDocumentsAsync(teamId);
            return documents;
        }

        public async Task<Document> GetDocumentAsync(Guid documentId)
        {
            var document = await _documentRepository.GetDocumentAsync(documentId);
            if (document == null)
            {
                throw new InvalidOperationException("Документ не найден.");
            }
            return document;
        }

        public async Task<Document> AddDocumentAsync(Document document)
        {
            document.DocumentId = Guid.NewGuid();
            document.CreatedAt = DateTime.UtcNow;
            document.UpdatedAt = DateTime.UtcNow;
            document.IsDeleted = false;
            return await _documentRepository.AddDocumentAsync(document);
        }

        public async Task<Document> UpdateDocumentAsync(Document document, Guid memberId, string changeDescription)
        {
            document.UpdatedAt = DateTime.UtcNow;
            var updatedDocument = await _documentRepository.UpdateDocumentAsync(document, memberId, changeDescription);
            if (updatedDocument == null)
            {
                throw new InvalidOperationException("Документ не найден или был удалён.");
            }
            return updatedDocument;
        }

        public async System.Threading.Tasks.Task DeleteDocumentAsync(Guid documentId)
        {
            var deletedDocument = await _documentRepository.DeleteDocumentAsync(documentId);
            if (deletedDocument == null)
            {
                throw new InvalidOperationException("Документ не найден или был удалён.");
            }
        }

        public async Task<IEnumerable<DocumentChange>> GetDocumentChangesAsync(Guid documentId)
        {
            var changes = await _documentRepository.GetDocumentChangesAsync(documentId);
            return changes;
        }

        public async Task<DocumentChange> GetDocumentChangeAsync(Guid documentChangeId)
        {
            var change = await _documentRepository.GetDocumentChangeAsync(documentChangeId);
            if (change == null)
            {
                throw new InvalidOperationException("Изменение документа не найдено.");
            }
            return change;
        }

        public async Task<DocumentChange> AddDocumentChangeAsync(DocumentChange change)
        {
            change.DocumentChangeId = Guid.NewGuid();
            change.ChangedAt = DateTime.UtcNow;
            return await _documentRepository.AddDocumentChangeAsync(change);
        }

        public async Task<DocumentChange> UpdateDocumentChangeAsync(DocumentChange change)
        {
            var updatedChange = await _documentRepository.UpdateDocumentChangeAsync(change);
            if (updatedChange == null)
            {
                throw new InvalidOperationException("Изменение документа не найдено.");
            }
            return updatedChange;
        }

        public async System.Threading.Tasks.Task DeleteDocumentChangeAsync(Guid documentChangeId)
        {
            var deletedChange = await _documentRepository.DeleteDocumentChangeAsync(documentChangeId);
            if (deletedChange == null)
            {
                throw new InvalidOperationException("Изменение документа не найдено.");
            }
        }
    }
}