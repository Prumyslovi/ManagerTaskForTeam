﻿using Microsoft.AspNetCore.SignalR;

namespace ManagerTaskForTeam.API.Hubs
{
    public class DocumentHub : Hub
    {
        public async Task SendUpdate(Guid documentId, string content, Guid memberId)
        {
            await Clients.OthersInGroup(documentId.ToString()).SendAsync("ReceiveUpdate", documentId, content, memberId);
        }

        public async Task JoinDocument(string documentId)
        {
            if (string.IsNullOrEmpty(documentId))
            {
                throw new HubException("Document ID cannot be null or empty.");
            }
            await Groups.AddToGroupAsync(Context.ConnectionId, documentId);
        }

        public async Task LeaveDocument(Guid documentId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, documentId.ToString());
        }
    }
}