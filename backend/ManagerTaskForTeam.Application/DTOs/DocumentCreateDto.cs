namespace ManagerTaskForTeam.Application.DTOs
{
    public class DocumentCreateDto
    {
        public Guid TeamId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public Guid CreatedBy { get; set; }
    }
}
