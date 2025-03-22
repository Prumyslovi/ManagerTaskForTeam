using CarnetDeTaches.Hubs;
using CarnetDeTaches.Model;
using CarnetDeTaches.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace CarnetDeTaches.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentsController : ControllerBase
    {
        private readonly IDocumentRepository _documentRepository;
        private readonly IHubContext<DocumentHub> _hubContext;

        public DocumentsController(IDocumentRepository documentRepository, IHubContext<DocumentHub> hubContext)
        {
            _documentRepository = documentRepository;
            _hubContext = hubContext;
        }

        [HttpGet("GetAllDocuments/{teamId}")]
        public ActionResult GetAllDocuments(Guid teamId)
        {
            var documents = _documentRepository.GetAllDocuments(teamId)
                .Select(d => new { d.DocumentId, d.Title, d.CreatedAt, d.UpdatedAt });
            return Ok(documents);
        }

        [HttpGet("GetDocumentContent/{documentId}")]
        public ActionResult GetDocumentContent(Guid documentId)
        {
            var document = _documentRepository.GetDocument(documentId);
            if (document == null) return NotFound();
            return Ok(new { document.Title, document.Content });
        }

        [HttpPost("AddDocument")]
        public ActionResult AddDocument([FromBody] DocumentCreateDto dto)
        {
            if (dto.CreatedBy == Guid.Empty)
            {
                return BadRequest("CreatedBy cannot be empty.");
            }

            var document = new Document
            {
                DocumentId = Guid.NewGuid(),
                TeamId = dto.TeamId,
                Title = dto.Title,
                Content = dto.Content,
                CreatedBy = dto.CreatedBy,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsDeleted = false
            };
            var createdDocument = _documentRepository.AddDocument(document);
            return CreatedAtAction(nameof(GetDocumentContent), new { documentId = createdDocument.DocumentId }, new { createdDocument.DocumentId });
        }

        [HttpPut("UpdateDocument/{documentId}")]
        public ActionResult UpdateDocument(Guid documentId, [FromBody] DocumentUpdateDto dto)
        {
            var document = _documentRepository.GetDocument(documentId);
            if (document == null) return NotFound();

            document.Content = dto.Content;
            document.UpdatedAt = DateTime.UtcNow;
            _documentRepository.UpdateDocument(document, dto.MemberId, dto.ChangeDescription);

            _hubContext.Clients.Group(documentId.ToString()).SendAsync("ReceiveUpdate", documentId, dto.Content, dto.MemberId);
            return NoContent();
        }

        [HttpGet("GetChanges/{documentId}")]
        public ActionResult GetChanges(Guid documentId)
        {
            var changes = _documentRepository.GetDocumentChanges(documentId)
                .Select(dc => new { dc.MemberId, dc.ChangeDescription, dc.ChangedAt });
            return Ok(changes);
        }
    }

    public class DocumentCreateDto
    {
        public Guid TeamId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public Guid CreatedBy { get; set; }
    }

    public class DocumentUpdateDto
    {
        public string Content { get; set; }
        public Guid MemberId { get; set; }
        public string ChangeDescription { get; set; }
    }
}