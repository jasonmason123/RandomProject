using System.Security.Cryptography;
using System.Text;

namespace DemoAuthWebBackend.Utils
{
    public class HelperMethods
    {
        private static readonly char[] AllowedChars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".ToCharArray();

        public static string GenerateRandomNumbers(int length)
        {
            StringBuilder builder = new StringBuilder();
            Random random = new Random();

            for (int i = 0; i < length; i++)
            {
                int digit = random.Next(0, 10);
                builder.Append(digit);
            }

            return builder.ToString();
        }

        public static string GenerateRandomString(int length)
        {
            if (length <= 0)
            {
                throw new ArgumentException("Length must be greater than zero.", nameof(length));
            }

            var random = new Random();
            var stringBuilder = new StringBuilder(length);

            for (int i = 0; i < length; i++)
            {
                int index = random.Next(AllowedChars.Length);
                stringBuilder.Append(AllowedChars[index]);
            }

            return stringBuilder.ToString();
        }

        public static string ComputeSHA256(string input)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(input);
                var hash = sha256.ComputeHash(bytes);

                var sb = new StringBuilder();
                foreach (var b in hash)
                    sb.Append(b.ToString("x2"));

                return sb.ToString(); // 64-character hex string
            }
        }
    }
}
