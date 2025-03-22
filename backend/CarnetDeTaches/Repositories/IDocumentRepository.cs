using CarnetDeTaches.Model;

namespace CarnetDeTaches.Repositories
{
    public interface IDocumentRepository
    {
        IEnumerable<Document> GetAllDocuments(Guid teamId);
        Document GetDocument(Guid documentId);
        Document AddDocument(Document document);
        Document UpdateDocument(Document document, Guid memberId, string changeDescription);
        IEnumerable<DocumentChange> GetDocumentChanges(Guid documentId);
        DocumentChange GetDocumentChange(Guid documentChangeId);
        DocumentChange AddDocumentChange(DocumentChange change);
        DocumentChange UpdateDocumentChange(DocumentChange change);
        DocumentChange DeleteDocumentChange(Guid documentChangeId);
    }
}