using DemoAuthWebBackend.Entities;
using DemoAuthWebBackend.Infrastructure.AuthenticationService.DTOs;
using DemoAuthWebBackend.Infrastructure.AuthenticationService.OtpAuthentication;
using DemoAuthWebBackend.Infrastructure.NotificationService;
using DemoAuthWebBackend.Infrastructure.NotificationService.DTOs;
using DemoAuthWebBackend.Utils;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;

namespace SpendingTracker_API.Authentication.OtpAuthentication
{
    public class EmailOtpAuth : IOtpAuth
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly INotificationSender _notificationService;
        private readonly IMemoryCache _memoryCache;

        public EmailOtpAuth(UserManager<AppUser> userManager, INotificationSender notificationService, IMemoryCache memoryCache)
        {
            _userManager = userManager;
            _notificationService = notificationService;
            _memoryCache = memoryCache;
        }

        public async Task<string> SendOtpAsync(AppUser user)
        {
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var code = HelperMethods.GenerateRandomNumbers(6);
            var cacheKey = HelperMethods.GenerateRandomString(20);
            var cacheData = new OtpCacheData
            {
                ConfirmationToken = token,
                OtpCode = code,
                UserId = user.Id,
            };
            _memoryCache.Set(
                AppConstants.OTP_CACHE_KEY_PREFIX + cacheKey,
                cacheData,
                TimeSpan.FromMinutes(AppConstants.OTP_TIME_EXPIRED_IN_MINUTES));

            var message = new MessageStructureDto
            {
                Subject = "Email Verification",
                Body = $"Your verification code is: <b>{code}</b>",
                IsHtmlBody = true,
            };

            // Fire and forget
            _notificationService.SendAsync(user.Email!, message);

            return cacheKey;
        }

        public async Task<string> ResendOtpAsync(string oldKey)
        {
            _memoryCache.TryGetValue<OtpCacheData>(AppConstants.OTP_CACHE_KEY_PREFIX + oldKey, out var cacheData);
            if (cacheData == null)
                throw new InvalidOperationException("Invalid or expired key");

            var user = await _userManager.FindByIdAsync(cacheData.UserId!)
                ?? throw new InvalidOperationException("User not found");

            _memoryCache.Remove(oldKey);
            // Invalidate the previous email confirmation token
            await _userManager.UpdateSecurityStampAsync(user);

            return await SendOtpAsync(user);
        }

        public async Task<AuthenticationResult> VerifyAsync(string key, string code)
        {
            _memoryCache.TryGetValue<OtpCacheData>(AppConstants.OTP_CACHE_KEY_PREFIX + key, out var cacheData);
            if(cacheData == null)
            {
                return await Task.FromResult(new AuthenticationResult
                {
                    IsLockedOut = false,
                    Succeeded = false,
                    User = null,
                });
            }

            var user = await _userManager.FindByIdAsync(cacheData.UserId!)
                ?? throw new InvalidOperationException("User not found");

            var authResult = await _userManager.ConfirmEmailAsync(user, cacheData.ConfirmationToken!);

            return new AuthenticationResult
            {
                IsLockedOut = false,
                Succeeded = authResult.Succeeded,
                User = user,
            };
        }
    }
}
