using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Interfaces.Services
{
    public interface IDocumentService
    {
        Task<IEnumerable<Document>> GetAllDocumentsAsync(Guid teamId);
        Task<Document> GetDocumentAsync(Guid documentId);
        Task<Document> AddDocumentAsync(Document document);
        Task<Document> UpdateDocumentAsync(Document document, Guid memberId, string changeDescription);
        System.Threading.Tasks.Task DeleteDocumentAsync(Guid documentId);
        Task<IEnumerable<DocumentChange>> GetDocumentChangesAsync(Guid documentId);
        Task<DocumentChange> GetDocumentChangeAsync(Guid documentChangeId);
        Task<DocumentChange> AddDocumentChangeAsync(DocumentChange change);
        Task<DocumentChange> UpdateDocumentChangeAsync(DocumentChange change);
        System.Threading.Tasks.Task DeleteDocumentChangeAsync(Guid documentChangeId);
    }
}