using Microsoft.AspNetCore.SignalR;

namespace ManagerTaskForTeam.API.Hubs
{
    public class DocumentHub : Hub
    {
        public async Task SendUpdate(Guid documentId, string content, Guid memberId)
        {
            Console.WriteLine($"Document {documentId} updated by {memberId}");
            await Clients.OthersInGroup(documentId.ToString()).SendAsync("ReceiveUpdate", documentId, content, memberId);
        }

        public async Task JoinDocument(Guid documentId)
        {
            if (documentId == Guid.Empty)
            {
                throw new HubException("Document ID cannot be empty.");
            }
            await Groups.AddToGroupAsync(Context.ConnectionId, documentId.ToString());
        }

        public async Task LeaveDocument(Guid documentId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, documentId.ToString());
        }
    }
}