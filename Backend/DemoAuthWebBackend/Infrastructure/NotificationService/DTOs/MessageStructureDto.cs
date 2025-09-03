namespace DemoAuthWebBackend.Infrastructure.NotificationService.DTOs
{
    public class MessageStructureDto
    {
        public string Subject { get; set; }
        public string Body { get; set; }
        public string[] AttachmentPaths { get; set; }
        public bool IsHtmlBody { get; set; }
    }
}
