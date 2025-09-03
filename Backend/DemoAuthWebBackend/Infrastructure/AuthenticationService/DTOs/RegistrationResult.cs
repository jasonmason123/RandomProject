using DemoAuthWebBackend.Entities;

namespace DemoAuthWebBackend.Infrastructure.AuthenticationService.DTOs
{
    public class RegistrationResult
    {
        public bool Succeeded { get; set; }
        public bool RequiresVerification { get; set; }
        public AppUser? User { get; set; }
        public string? ConfirmationToken { get; set; } // Token for email confirmation or verification
        public string? Message { get; set; }
    }
}
