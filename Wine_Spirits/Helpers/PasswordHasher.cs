using System.Security.Cryptography;
using System.Text;

namespace Wine_Spirits.Helpers;

public static class PasswordHasher
{
    /// <summary>
    /// Düz metin şifreyi SHA256 ile hash'ler.
    /// </summary>
    public static string HashPassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password)) return null;

        using (SHA256 sha256Hash = SHA256.Create())
        {
            byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(password));

            StringBuilder builder = new StringBuilder();
            foreach (byte b in bytes)
            {
                builder.Append(b.ToString("x2"));
            }
            return builder.ToString();
        }
    }

    /// <summary>
    /// Girilen şifreyi hash'leyip veritabanındaki ile karşılaştırır.
    /// </summary>
    public static bool VerifyPassword(string enteredPassword, string storedHash)
    {
        if (string.IsNullOrWhiteSpace(enteredPassword) || string.IsNullOrWhiteSpace(storedHash))
            return false;

        string hashOfEntered = HashPassword(enteredPassword);
        return string.Equals(hashOfEntered, storedHash, StringComparison.OrdinalIgnoreCase);
    }
}