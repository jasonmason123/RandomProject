using DemoAuthWebBackend.Infrastructure.AuthenticationService.DTOs;
using Microsoft.AspNetCore.Authentication;

namespace DemoAuthWebBackend.Infrastructure.AuthenticationService.OAuthAuthentication
{
    public interface IOAuthAuthentication
    {
        Task<AuthenticationResult> AuthenticateOrRegisterAsync(AuthenticateResult oauthAuthenticateResult);
    }
}
