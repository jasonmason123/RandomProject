using DemoAuthWebBackend.Infrastructure.NotificationService.DTOs;

namespace DemoAuthWebBackend.Infrastructure.NotificationService
{
    public interface INotificationSender
    {
        public Task SendAsync(string recipient, MessageStructureDto emailContent);
    }
}
