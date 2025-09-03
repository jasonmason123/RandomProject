using DemoAuthWebBackend.Context;
using DemoAuthWebBackend.Entities;
using DemoAuthWebBackend.Utils;
using DemoAuthWebBackend.Utils.AuthTokenService;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace DemoAuthWebBackend.Infrastructure.AuthTokenService
{
    public class JwtProvider : IAuthTokenProvider
    {
        private readonly IConfiguration _configuration;
        private readonly AppDbContext _AppDbContext;

        private string JwtSecretKey => Environment.GetEnvironmentVariable(EnvNames.JWT_SECRET_KEY) ?? "";
        private string JwtIssuer => _configuration["JwtSettings:Issuer"] ?? "";
        private string JwtAudience => _configuration["JwtSettings:Audience"] ?? "";
        private string JwtExpirationInMinutesString => _configuration["JwtSettings:ExpirationInMinutes"] ?? "";

        private const string ERROR_INVALID_TOKEN_FORMAT = "Invalid token format.";
        private const string ERROR_TOKEN_EXPIRED = "Token has expired.";
        private const string ERROR_INVALID_TOKEN = "Token is invalid.";

        public JwtProvider(IConfiguration configuration, AppDbContext appDbContext)
        {
            _configuration = configuration;
            _AppDbContext = appDbContext;
        }
        public string GenerateToken(AppUser user)
        {
            var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtSecretKey));
            var signinCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);
            var expirationInMinutes = int.Parse(JwtExpirationInMinutesString);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            var tokenOptions = new JwtSecurityToken(
                issuer: JwtIssuer,
                audience: JwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(expirationInMinutes)),
                signingCredentials: signinCredentials
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(tokenOptions);
            return tokenString;
        }

        public ClaimsPrincipal ValidateToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(JwtSecretKey);

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,            // Ensure the token was issued by a trusted issuer
                ValidateAudience = true,          // Ensure the token is for the correct audience
                ValidateLifetime = true,          // Ensure the token hasn't expired
                ValidateIssuerSigningKey = true,  // Ensure the signing key is valid

                ValidIssuer = JwtIssuer,
                ValidAudience = JwtAudience,
                IssuerSigningKey = new SymmetricSecurityKey(key)
            };

            try
            {
                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);

                if (validatedToken is JwtSecurityToken jwtSecurityToken)
                {
                    return principal;
                }

                throw new SecurityTokenException(ERROR_INVALID_TOKEN_FORMAT);
            }
            catch (SecurityTokenExpiredException)
            {
                throw new SecurityTokenException(ERROR_TOKEN_EXPIRED + ": " + token);
            }
            catch (SecurityTokenException ex)
            {
                throw new SecurityTokenException(ERROR_INVALID_TOKEN + ": " + token + ", " + ex);
            }
        }
    }
}
