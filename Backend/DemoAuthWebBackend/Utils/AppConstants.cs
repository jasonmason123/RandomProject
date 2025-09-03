namespace DemoAuthWebBackend.Utils
{
    public class AppConstants
    {
        //Auth cookie
        public const string JWT_COOKIE_KEY = "user_session";

        //OTP
        public const string OTP_CACHE_KEY_PREFIX = "46ec1e05f1c82f7be23eec90d1df8ed5cce8d19";
        public const int OTP_MAX_FAILED_ATTEMPTS = 5;
        public const int OTP_TIME_EXPIRED_IN_MINUTES = 5;
    }
}
