namespace DemoAuthWebBackend.Utils.Messages
{
    public class ErrorMessages
    {
        public const string INTERNAL_SERVER_ERROR_MESSAGE = "Internal server error";
        public const string USER_NOT_AUTHENTICATED = "User is not authenticated.";

        public const string USER_EMAIL_NOT_FOUND = "User not found with the provided email.";
        public const string USER_EMAIL_NOT_CONFIRMED = "User email is not confirmed.";
        public const string USER_LOCKED_OUT_UNTIL = "User is locked out until ";
    }
}
