using DemoAuthWebBackend.Entities;
using DemoAuthWebBackend.Infrastructure.AuthenticationService.DTOs;
using DemoAuthWebBackend.Infrastructure.AuthenticationService.OAuthAuthentication;
using DemoAuthWebBackend.Infrastructure.AuthenticationService.OtpAuthentication;
using DemoAuthWebBackend.Utils;
using DemoAuthWebBackend.Utils.AuthTokenService;
using DemoAuthWebBackend.Utils.Messages;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpendingTracker_API.Authentication.PasswordAuthentication;
using System.Text;
using System.Text.Json;

namespace DemoAuthWebBackend.Controllers.Apis
{
    [ApiController]
    [Route("api/auth/web")]
    public class AuthenticationController(
        IConfiguration _configuration,
        IPasswordAuth _passwordAuth,
        IAuthTokenProvider _authTokenService,
        IOtpAuth _otpAuth,
        IOAuthAuthentication _oAuthAuthentication
    ) : ControllerBase
    {
        private const string IS_LOGGED_IN_COOKIE_KEY = "isLoggedIn";
        private const string USER_INFO_COOKIE_KEY = "userInfo";

        [HttpPost("sign-in")]
        public async Task<IActionResult> DefaultSignIn(
            [FromBody] PasswordCredentialsDto passwordCredentials,
            [FromQuery] bool? remember = false
        )
        {
            try
            {
                var authResult = await _passwordAuth.AuthenticateAsync(passwordCredentials);
                if (authResult.Succeeded && authResult.User != null)
                {
                    if (authResult.IsEmailConfirmed)
                    {
                        var jwtToken = _authTokenService.GenerateToken(authResult.User);
                        SetAuthCookies(authResult.User, jwtToken, remember ?? false);
                        Console.WriteLine("Signed in successfully");
                        return Ok(new
                        {
                            Succeeded = authResult.Succeeded,
                        });
                    }
                    Console.WriteLine("Authentication succeeded but email confirmation is required");
                    var confirmationToken = await _otpAuth.SendOtpAsync(authResult.User);
                    return Ok(new
                    {
                        Succeeded = authResult.Succeeded,
                        IsEmailConfirmed = authResult.IsEmailConfirmed,
                        ConfirmationToken = confirmationToken,
                    });
                }

                Console.WriteLine($"Succeeded: {authResult.Succeeded}");
                Console.WriteLine($"IsLockedOut: {authResult.IsLockedOut}");
                Console.WriteLine($"IsEmailConfirmed: {authResult.IsEmailConfirmed}");
                return Unauthorized(new
                {
                    Succeeded = authResult.IsLockedOut ? false : authResult.Succeeded,
                    IsLockedOut = authResult.IsLockedOut,
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Sign-in error: {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        [HttpPost("sign-up")]
        public async Task<IActionResult> DefaultSignUp([FromBody] RegistrationCredentialsDto passwordCredentials)
        {
            try
            {
                var registrationResult = await _passwordAuth.RegisterAsync(passwordCredentials, true);
                if (registrationResult.Succeeded && registrationResult.User != null)
                {
                    var confirmationToken = await _otpAuth.SendOtpAsync(registrationResult.User);
                    return Ok(confirmationToken);
                }
                Console.WriteLine($"Failed to register user: {registrationResult.Message}");
                return BadRequest(registrationResult.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Sign-up error: {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        [HttpPost("verify-account/{verificationKey}")]
        public async Task<IActionResult> VerifyAccountSignUp(string verificationKey, [FromForm] string code)
        {
            try
            {
                var result = await _otpAuth.VerifyAsync(verificationKey, code);

                if (!result.Succeeded)
                {
                    return BadRequest("Wrong code or code may have expired");
                }

                var jwtToken = _authTokenService.GenerateToken(result.User!);
                SetAuthCookies(result.User!, jwtToken, false);
                Console.WriteLine("Registration completed");

                return Ok();
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine(ex);
                return BadRequest("Invalid key");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Verify account error: {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        [HttpPost("verify-account/resend/{oldVerificationKey}")]
        public async Task<IActionResult> ResendOtpCode(string oldVerificationKey)
        {
            try
            {
                var newVerificationKey = await _otpAuth.ResendOtpAsync(oldVerificationKey);
                return Ok(new
                {
                    Key = newVerificationKey
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ResendOtpCode error: {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        [HttpPost("request-reset-password")]
        public async Task<IActionResult> RequestResetPassword([FromForm] string email)
        {
            try
            {
                await _passwordAuth.RequestResetPasswordAsync(email);
                return Ok();
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine(ex);
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ResetPassword error: {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        [HttpPost("reset-password/{encodedToken}")]
        public async Task<IActionResult> ResetPassword(string encodedToken, [FromForm] string newPassword)
        {
            try
            {
                var result = await _passwordAuth.ResetPasswordAsync(encodedToken, newPassword);
                return result ? Ok() : BadRequest();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ResetPassword error: {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        // Oauth workflow for web, using cookies:
        [HttpGet("sign-in/google")]
        public IActionResult GoogleWebSignIn([FromQuery(Name = "remember")] bool? remember)
        {
            var redirectUrl = $"{Request.Scheme}://{Request.Host.Value}{Request.PathBase.Value}/api/auth/web/sign-in/google/callback";
            if (remember == true)
            {
                redirectUrl += "?remember=true";
            }
            var properties = new AuthenticationProperties { RedirectUri = redirectUrl };
            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        [HttpGet("sign-in/google/callback")]
        public async Task<IActionResult> GoogleCallback([FromQuery(Name = "remember")] bool? remember)
        {
            try
            {
                var oauthResult = await HttpContext.AuthenticateAsync(GoogleDefaults.AuthenticationScheme);
                var result = await _oAuthAuthentication.AuthenticateOrRegisterAsync(oauthResult);

                if(!result.Succeeded)
                    return Redirect("/login?error=OAuth%20failed");

                var jwtToken = _authTokenService.GenerateToken(result.User!);

                SetAuthCookies(result.User!, jwtToken, remember ?? false);
                return Redirect("/");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Google sign-in error: {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpPost("sign-out")]
        public IActionResult SignOutFromWeb()
        {
            try
            {
                RemoveAuthCookies();
                Console.WriteLine("Signed out successfully");
                return Ok(new { message = "Signed out successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Sign-out error: {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        // Helper methods to set auth cookies
        private void SetAuthCookies(AppUser user, string jwtToken, bool remember = false)
        {
            var expirationInMinutesString = _configuration["JwtSettings:ExpirationInMinutes"] ?? "";
            var expirationInMinutes = int.Parse(expirationInMinutesString);
            var expirationDateUtc = DateTimeOffset.UtcNow.AddMinutes(expirationInMinutes);

            Response.Cookies.Append(AppConstants.JWT_COOKIE_KEY, jwtToken, new CookieOptions
            {
                Secure = true,
                SameSite = SameSiteMode.Strict,
                HttpOnly = true,
                Expires = remember ? expirationDateUtc : null
            });

            // Add base64 userInfo cookie
            var userObj = new
            {
                username = user.UserName,
                email = user.Email,
                dateJoined = user.CreatedAt,
            };
            var json = JsonSerializer.Serialize(userObj);
            var base64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(json));
            Response.Cookies.Append(USER_INFO_COOKIE_KEY, base64, new CookieOptions
            {
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = remember ? expirationDateUtc : null
            });

            // Add IsLoggedIn cookie
            Response.Cookies.Append(IS_LOGGED_IN_COOKIE_KEY, "true", new CookieOptions
            {
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = remember ? expirationDateUtc : null
            });
        }

        private void RemoveAuthCookies()
        {
            Response.Cookies.Delete(AppConstants.JWT_COOKIE_KEY);
            Response.Cookies.Delete(IS_LOGGED_IN_COOKIE_KEY);
            Response.Cookies.Delete(USER_INFO_COOKIE_KEY);
        }
    }
}
