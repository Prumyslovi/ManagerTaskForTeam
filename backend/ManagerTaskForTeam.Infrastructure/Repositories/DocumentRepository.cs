using ManagerTaskForTeam.Application.Interfaces.Repositories;
using ManagerTaskForTeam.Domain.Entities;
using ManagerTaskForTeam.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Infrastructure.Repositories
{
    public class DocumentRepository : IDocumentRepository
    {
        private readonly ManagerTaskForTeamDbContext _context;

        public DocumentRepository(ManagerTaskForTeamDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Document>> GetAllDocumentsAsync(Guid teamId)
        {
            return await _context.Documents
                .Include(d => d.CreatedByMember)
                .Where(d => d.TeamId == teamId && !d.IsDeleted)
                .ToListAsync();
        }

        public async Task<Document> GetDocumentAsync(Guid documentId)
        {
            return await _context.Documents
                .Include(d => d.CreatedByMember)
                .FirstOrDefaultAsync(d => d.DocumentId == documentId && !d.IsDeleted);
        }

        public async Task<Document> AddDocumentAsync(Document document)
        {
            await _context.Documents.AddAsync(document);
            await _context.SaveChangesAsync();
            return document;
        }

        public async Task<Document> UpdateDocumentAsync(Document document, Guid memberId, string changeDescription)
        {
            var existingDocument = await _context.Documents
                .FirstOrDefaultAsync(d => d.DocumentId == document.DocumentId && !d.IsDeleted);

            if (existingDocument == null)
            {
                return null;
            }

            existingDocument.Title = document.Title;
            existingDocument.Content = document.Content;
            existingDocument.UpdatedAt = document.UpdatedAt;

            var change = new DocumentChange
            {
                DocumentChangeId = Guid.NewGuid(),
                DocumentId = document.DocumentId,
                MemberId = memberId,
                ChangeDescription = changeDescription,
                ChangedAt = DateTime.UtcNow
            };

            await _context.DocumentChanges.AddAsync(change);
            _context.Documents.Update(existingDocument);
            await _context.SaveChangesAsync();
            return existingDocument;
        }

        public async Task<Document> DeleteDocumentAsync(Guid documentId)
        {
            var existingDocument = await _context.Documents
                .FirstOrDefaultAsync(d => d.DocumentId == documentId && !d.IsDeleted);

            if (existingDocument == null)
            {
                return null;
            }

            existingDocument.IsDeleted = true;
            _context.Documents.Update(existingDocument);
            await _context.SaveChangesAsync();
            return existingDocument;
        }

        public async Task<IEnumerable<DocumentChange>> GetDocumentChangesAsync(Guid documentId)
        {
            return await _context.DocumentChanges
                .Include(d => d.Member)
                .Where(dc => dc.DocumentId == documentId)
                .OrderByDescending(dc => dc.ChangedAt)
                .ToListAsync();
        }

        public async Task<DocumentChange> GetDocumentChangeAsync(Guid documentChangeId)
        {
            return await _context.DocumentChanges
                .Include(d => d.Member)
                .FirstOrDefaultAsync(dc => dc.DocumentChangeId == documentChangeId);
        }

        public async Task<DocumentChange> AddDocumentChangeAsync(DocumentChange change)
        {
            await _context.DocumentChanges.AddAsync(change);
            await _context.SaveChangesAsync();
            return change;
        }

        public async Task<DocumentChange> UpdateDocumentChangeAsync(DocumentChange change)
        {
            var existingChange = await _context.DocumentChanges
                .FirstOrDefaultAsync(dc => dc.DocumentChangeId == change.DocumentChangeId);

            if (existingChange == null)
            {
                return null;
            }

            existingChange.ChangeDescription = change.ChangeDescription;
            existingChange.ChangedAt = DateTime.UtcNow;

            _context.DocumentChanges.Update(existingChange);
            await _context.SaveChangesAsync();
            return existingChange;
        }

        public async Task<DocumentChange> DeleteDocumentChangeAsync(Guid documentChangeId)
        {
            var change = await _context.DocumentChanges
                .FirstOrDefaultAsync(dc => dc.DocumentChangeId == documentChangeId);

            if (change == null)
            {
                return null;
            }

            _context.DocumentChanges.Remove(change);
            await _context.SaveChangesAsync();
            return change;
        }
    }
}