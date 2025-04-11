using CarnetDeTaches.Model;
using Microsoft.EntityFrameworkCore;

namespace CarnetDeTaches.Repositories
{
    public class DocumentRepository : IDocumentRepository
    {
        private readonly DdCarnetDeTaches _context;

        public DocumentRepository(DdCarnetDeTaches context)
        {
            _context = context;
        }

        public IEnumerable<Document> GetAllDocuments(Guid teamId)
        {
            if (_context == null)
            {
                throw new InvalidOperationException("Контекст базы данных не инициализирован.");
            }

            try
            {
                return _context.Documents
                    .Include(d => d.CreatedByMember)
                    .Where(d => d.TeamId == teamId && !d.IsDeleted)
                    .ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка получения всех документов: {ex.Message}");
                throw;
            }
        }

        public Document GetDocument(Guid documentId)
        {
            return _context.Documents
                .Include(d => d.CreatedByMember)
                .FirstOrDefault(d => d.DocumentId == documentId && !d.IsDeleted);
        }

        public Document AddDocument(Document document)
        {
            _context.Documents.Add(document);
            _context.SaveChanges();
            return document;
        }

        public Document UpdateDocument(Document document, Guid memberId, string changeDescription)
        {
            _context.Documents.Update(document);
            var change = new DocumentChange
            {
                DocumentChangeId = Guid.NewGuid(),
                DocumentId = document.DocumentId,
                MemberId = memberId,
                ChangeDescription = changeDescription,
                ChangedAt = DateTime.UtcNow
            };
            _context.DocumentChanges.Add(change);
            _context.SaveChanges();
            return document;
        }

        public IEnumerable<DocumentChange> GetDocumentChanges(Guid documentId)
        {
            return _context.DocumentChanges
                .Include(d => d.Member)
                .Where(dc => dc.DocumentId == documentId)
                .OrderByDescending(dc => dc.ChangedAt)
                .ToList();
        }

        public DocumentChange GetDocumentChange(Guid documentChangeId)
        {
            return _context.DocumentChanges
                .Include(d => d.Member)
                .FirstOrDefault(dc => dc.DocumentChangeId == documentChangeId);
        }

        public DocumentChange AddDocumentChange(DocumentChange change)
        {
            _context.DocumentChanges.Add(change);
            _context.SaveChanges();
            return change;
        }

        public DocumentChange UpdateDocumentChange(DocumentChange change)
        {
            _context.DocumentChanges.Update(change);
            _context.SaveChanges();
            return change;
        }

        public DocumentChange DeleteDocumentChange(Guid documentChangeId)
        {
            var change = _context.DocumentChanges.Find(documentChangeId);
            if (change != null)
            {
                _context.DocumentChanges.Remove(change);
                _context.SaveChanges();
            }
            return change;
        }
    }
}