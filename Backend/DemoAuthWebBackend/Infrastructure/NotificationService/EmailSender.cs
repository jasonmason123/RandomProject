using System.Net.Mail;
using System.Net;
using DemoAuthWebBackend.Utils;
using DemoAuthWebBackend.Infrastructure.NotificationService.DTOs;

namespace DemoAuthWebBackend.Infrastructure.NotificationService
{
    public class EmailSender : INotificationSender
    {
        private string smtpClientDomain => Environment.GetEnvironmentVariable(EnvNames.GMAIL_SMTP_CLIENT_DOMAIN) ?? "";
        private string emailFrom => Environment.GetEnvironmentVariable(EnvNames.GMAIL_FROM) ?? "";
        private string appPass => Environment.GetEnvironmentVariable(EnvNames.GMAIL_APP_PASS) ?? "";
        private string clientPort => Environment.GetEnvironmentVariable(EnvNames.GMAIL_CLIENT_PORT) ?? "";

        public async Task SendAsync(string recipient, MessageStructureDto emailContent)
        {
            var clientPortInt = int.Parse(clientPort);
            var smtpClient = new SmtpClient(smtpClientDomain)
            {
                Port = clientPortInt,
                Credentials = new NetworkCredential(emailFrom, appPass),
                EnableSsl = true,
            };

            //building MailMessage
            var mailMessage = new MailMessage
            {
                From = new MailAddress(emailFrom),
                Subject = emailContent.Subject,
                Body = emailContent.Body,
                IsBodyHtml = true,
            };

            mailMessage.To.Add(recipient);

            if (emailContent.AttachmentPaths != null)
            {
                foreach (var path in emailContent.AttachmentPaths)
                {
                    if (File.Exists(path)) // Check if the file exists
                    {
                        var attachment = new Attachment(path);
                        mailMessage.Attachments.Add(attachment);
                    }
                }
            }

            //send email
            await smtpClient.SendMailAsync(mailMessage);
        }
    }
}
