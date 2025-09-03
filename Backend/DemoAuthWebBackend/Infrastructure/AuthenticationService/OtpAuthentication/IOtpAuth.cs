using DemoAuthWebBackend.Entities;
using DemoAuthWebBackend.Infrastructure.AuthenticationService.DTOs;

namespace DemoAuthWebBackend.Infrastructure.AuthenticationService.OtpAuthentication
{
    public interface IOtpAuth
    {
        /// <summary>
        /// Generates email confirmation token for user and OTP, and send to user
        /// </summary>
        /// <param name="user">The user account which requires confirmation</param>
        /// <returns>The key used to authenticate along with the user-entered OTP code</returns>
        Task<string> SendOtpAsync(AppUser user);
        /// <summary>
        /// Invalidates the old OTP and regenerates a new one
        /// </summary>
        /// <param name="oldKey">The old key</param>
        /// <returns>The new key</returns>
        Task<string> ResendOtpAsync(string oldKey);
        /// <summary>
        /// Authenticate the OTP code
        /// </summary>
        /// <param name="key">The key used to authenticate along with the user-entered OTP code</param>
        /// <param name="code">The OTP code entered by user</param>
        /// <returns>The authentication result</returns>
        Task<AuthenticationResult> VerifyAsync(string key, string code);
    }
}
