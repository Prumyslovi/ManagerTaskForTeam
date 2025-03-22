using Microsoft.AspNetCore.SignalR;

namespace CarnetDeTaches.Hubs
{
    public class DocumentHub : Hub
    {
        public async Task SendUpdate(Guid documentId, string content, Guid memberId)
        {
            await Clients.OthersInGroup(documentId.ToString()).SendAsync("ReceiveUpdate", documentId, content, memberId);
        }

        public async Task JoinDocument(Guid documentId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, documentId.ToString());
        }

        public async Task LeaveDocument(Guid documentId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, documentId.ToString());
        }
    }
}