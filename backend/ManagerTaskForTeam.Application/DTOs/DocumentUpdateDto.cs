namespace ManagerTaskForTeam.Application.DTOs
{
    public class DocumentUpdateDto
    {
        public string Content { get; set; }
        public string Title { get; set; }
        public Guid MemberId { get; set; }
        public string ChangeDescription { get; set; }
    }
}