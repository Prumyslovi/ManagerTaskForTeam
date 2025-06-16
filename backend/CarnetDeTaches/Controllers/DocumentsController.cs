using ManagerTaskForTeam.Application.DTOs;
using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using ManagerTaskForTeam.API.Hubs;
using System;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentsController : ControllerBase
    {
        private readonly IDocumentService _documentService;
        private readonly IHubContext<DocumentHub> _hubContext;

        public DocumentsController(IDocumentService documentService, IHubContext<DocumentHub> hubContext)
        {
            _documentService = documentService;
            _hubContext = hubContext;
        }

        [HttpGet("GetAllDocuments/{teamId}")]
        public async Task<ActionResult> GetAllDocuments(Guid teamId)
        {
            var documents = await _documentService.GetAllDocumentsAsync(teamId);
            return Ok(documents);
        }

        [HttpGet("GetDocumentContent/{documentId}")]
        public async Task<ActionResult> GetDocumentContent(Guid documentId)
        {
            var document = await _documentService.GetDocumentAsync(documentId);
            return Ok(new { document.Title, document.Content });
        }

        [HttpPost("AddDocument")]
        public async Task<ActionResult> AddDocument([FromBody] DocumentCreateDto dto)
        {
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
            var createdDocument = await _documentService.AddDocumentAsync(document);
            return CreatedAtAction(nameof(GetDocumentContent), new { documentId = createdDocument.DocumentId }, new { createdDocument.DocumentId });
        }

        [HttpPut("UpdateDocument/{documentId}")]
        public async Task<ActionResult> UpdateDocument(Guid documentId, [FromBody] DocumentUpdateDto dto)
        {
            var document = await _documentService.GetDocumentAsync(documentId);
            document.Content = dto.Content;
            document.Title = dto.Title; // Добавляем обновление title
            document.UpdatedAt = DateTime.UtcNow;
            await _documentService.UpdateDocumentAsync(document, dto.MemberId, dto.ChangeDescription);
            await _hubContext.Clients.Group(documentId.ToString()).SendAsync("ReceiveUpdate", documentId, dto.Content, dto.MemberId);
            return NoContent();
        }

        [HttpGet("GetChanges/{documentId}")]
        public async Task<ActionResult> GetChanges(Guid documentId)
        {
            var changes = await _documentService.GetDocumentChangesAsync(documentId);
            return Ok(changes);
        }
    }
}