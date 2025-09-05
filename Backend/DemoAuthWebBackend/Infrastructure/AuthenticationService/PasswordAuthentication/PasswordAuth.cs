using DemoAuthWebBackend.Context;
using DemoAuthWebBackend.Entities;
using DemoAuthWebBackend.Infrastructure.AuthenticationService.DTOs;
using DemoAuthWebBackend.Infrastructure.NotificationService;
using DemoAuthWebBackend.Infrastructure.NotificationService.DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using System.Text;

namespace SpendingTracker_API.Authentication.PasswordAuthentication
{
    public class PasswordAuth : IPasswordAuth
    {
        private const string ALLOWED_CHARACTERS_FOR_USERNAME = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";

        private readonly UserManager<AppUser> _userManager;
        private readonly INotificationSender _notificationService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public PasswordAuth(
            UserManager<AppUser> userManager,
            INotificationSender notificationService,
            IHttpContextAccessor httpContextAccessor
        )
        {
            _userManager = userManager;
            _notificationService = notificationService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<AuthenticationResult> AuthenticateAsync(PasswordCredentialsDto passwordCredentials)
        {
            var user = await _userManager.FindByEmailAsync(passwordCredentials.Email);

            if (user == null)
            {
                return new AuthenticationResult
                {
                    User = null,
                    IsLockedOut = false,
                    Succeeded = false,
                    IsEmailConfirmed = false,
                };
            }

            var result = new AuthenticationResult
            {
                User = user,
                IsEmailConfirmed = await _userManager.IsEmailConfirmedAsync(user),
                IsLockedOut = await _userManager.IsLockedOutAsync(user),
                Succeeded = await _userManager.CheckPasswordAsync(user, passwordCredentials.Password),
            };

            //Check lockout and email confirmation status
            if (!result.IsEmailConfirmed || result.IsLockedOut)
            {
                return result;
            }

            if (result.Succeeded)
            {
                // ✅ Reset failed count on success
                await _userManager.ResetAccessFailedCountAsync(user);
            }
            else
            {
                // ❌ Increment failed count
                await _userManager.AccessFailedAsync(user);

                if (await _userManager.IsLockedOutAsync(user))
                {
                    result.IsLockedOut = true;
                }
            }

            return result;
        }

        public async Task<RegistrationResult> RegisterAsync(RegistrationCredentialsDto registrationCredentials, bool requiresVerification = false)
        {
            if(registrationCredentials.Username == null)
            {
                registrationCredentials.Username = registrationCredentials.Email.Split("@")[0];
            }

            // Refine username before saving
            var refinedUsername = registrationCredentials.Username.Replace(" ", "_");
            refinedUsername = new string(refinedUsername.Where(c => ALLOWED_CHARACTERS_FOR_USERNAME.Contains(c)).ToArray());

            var user = new AppUser
            {
                UserName = refinedUsername,
                Email = registrationCredentials.Email,
                EmailConfirmed = !requiresVerification,
            };

            IdentityResult result;

            if (string.IsNullOrEmpty(registrationCredentials.Password))
            {
                result = await _userManager.CreateAsync(user);
            }
            else
            {
                result = await _userManager.CreateAsync(user, registrationCredentials.Password);
            }
            
            if (result.Succeeded)
            {
                var message = requiresVerification ?
                    "Registration successful. Please verify your email." :
                    "Registration successful without email verification.";

                return new RegistrationResult
                {
                    Succeeded = true,
                    RequiresVerification = requiresVerification,
                    User = user,
                    ConfirmationToken = null,
                    Message = message,
                };
            }

            var stringBuilder = new StringBuilder();
            foreach (var error in result.Errors)
            {
                stringBuilder.AppendLine(error.Description);
            }

            return new RegistrationResult
            {
                Succeeded = false,
                RequiresVerification = requiresVerification,
                User = null,
                ConfirmationToken = null,
                Message = stringBuilder.ToString()
            };
        }

        public async Task<bool> VerifyAccountEmailAsync(AppUser user, string token)
        {
            var result = await _userManager.ConfirmEmailAsync(user, token);
            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                {
                    Console.WriteLine(error.Description);
                }
            }
            return result.Succeeded;
        }

        public async Task RequestResetPasswordAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email)
                ?? throw new InvalidOperationException("User email not found");

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var composite = $"{user.Email}::{token}";
            var encoded = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(composite));

            var subject = "Your link to reset password";
            var httpRequest = _httpContextAccessor.HttpContext.Request;
            var url = $"{httpRequest.Scheme}://{httpRequest.Host}/recover-password/{encoded}";
            var body = $"<p>Visit here to reset your password: <a href=\"{url}\">{url}</a></p>";

            _notificationService.SendAsync(user.Email, new MessageStructureDto
            {
                Subject = subject,
                Body = body,
                IsHtmlBody = true
            });
        }

        public async Task<bool> ResetPasswordAsync(string encodedToken, string newPassword)
        {
            var decodedComposite = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(encodedToken));
            var parts = decodedComposite.Split("::");
            var userEmail = parts[0];
            var token = parts[1];

            var user = await _userManager.FindByEmailAsync(userEmail)
                ?? throw new ArgumentException("User not found");
            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
            if (!result.Succeeded)
            {
                foreach(var error in result.Errors)
                {
                    Console.WriteLine("Reset password error: " + error.Description);
                }
            }
            return result.Succeeded;
        }
    }
}
