using DemoAuthWebBackend.Entities;
using DemoAuthWebBackend.Infrastructure.AuthenticationService.DTOs;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using SpendingTracker_API.Authentication.PasswordAuthentication;
using System.Security.Claims;

namespace DemoAuthWebBackend.Infrastructure.AuthenticationService.OAuthAuthentication
{
    public class OAuthAuthentication(
        UserManager<AppUser> _userManager,
        IPasswordAuth _passwordAuth
    ) : IOAuthAuthentication
    {
        public async Task<AuthenticationResult> AuthenticateOrRegisterAsync(AuthenticateResult oauthAuthenticateResult)
        {
            var result = new AuthenticationResult
            {
                Succeeded = false
            };

            if (!oauthAuthenticateResult.Succeeded)
            {
                return result;
            }

            var claims = oauthAuthenticateResult.Principal?.Identities.FirstOrDefault()?.Claims;
            var email = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;

            if (string.IsNullOrEmpty(email))
            {
                return result;
            }

            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                //if user not exist, register
                var registrationCredentials = new RegistrationCredentialsDto
                {
                    Email = email,
                    Username = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value
                };

                var createdResult = await _passwordAuth.RegisterAsync(registrationCredentials);
                if (!createdResult.Succeeded || createdResult.User == null)
                {
                    Console.WriteLine($"[ERROR] Failed to create user: {createdResult.Message}");
                    result.User = createdResult.User;
                }
                else
                {
                    user = createdResult.User;
                    result.User = user;
                    result.Succeeded = true;
                    result.IsEmailConfirmed = true;
                    result.IsLockedOut = false;
                }
            }
            else
            {
                result.User = user;
                result.IsEmailConfirmed = await _userManager.IsEmailConfirmedAsync(user);
                result.IsLockedOut = await _userManager.IsLockedOutAsync(user);
                if (oauthAuthenticateResult.Succeeded && result.IsEmailConfirmed && !result.IsLockedOut)
                {
                    result.Succeeded = true;
                    await _userManager.ResetAccessFailedCountAsync(user);
                }
                else
                {
                    await _userManager.AccessFailedAsync(user);
                    if (await _userManager.IsLockedOutAsync(user))
                        result.IsLockedOut = true;
                }
            }

            return result;
        }
    }
}
