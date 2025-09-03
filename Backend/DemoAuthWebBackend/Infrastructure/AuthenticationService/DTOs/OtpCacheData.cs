namespace DemoAuthWebBackend.Infrastructure.AuthenticationService.DTOs
{
    public class OtpCacheData
    {
        public string? OtpCode { get; set; }
        public string? ConfirmationToken { get; set; }
        public string? UserId { get; set; }
        public int FailedAttempts { get; set; } = 0;
    }
}
