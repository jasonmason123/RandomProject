using DemoAuthWebBackend.Entities;
using System.Security.Claims;

namespace DemoAuthWebBackend.Utils.AuthTokenService
{
    public interface IAuthTokenProvider
    {
        public string GenerateToken(AppUser user);
        public ClaimsPrincipal ValidateToken(string token);
    }
}
