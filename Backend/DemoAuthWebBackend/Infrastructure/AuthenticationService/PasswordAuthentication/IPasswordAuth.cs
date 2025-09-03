using DemoAuthWebBackend.Entities;
using DemoAuthWebBackend.Infrastructure.AuthenticationService.DTOs;

namespace SpendingTracker_API.Authentication.PasswordAuthentication
{
    public interface IPasswordAuth
    {
        Task<AuthenticationResult> AuthenticateAsync(PasswordCredentialsDto passwordCredentials);
        Task<RegistrationResult> RegisterAsync(RegistrationCredentialsDto registrationCredentials, bool requiresVerification = false);
        Task<bool> VerifyAccountEmailAsync(AppUser user, string token);
        Task RequestResetPasswordAsync(string email);
        Task<bool> ResetPasswordAsync(string encodedToken, string newPassword);
    }
}
