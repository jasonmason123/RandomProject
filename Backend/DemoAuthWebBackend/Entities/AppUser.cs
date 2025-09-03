using DemoAuthWebBackend.Utils.Enums;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace DemoAuthWebBackend.Entities
{
    [Table(nameof(AppUser))]
    public class AppUser : IdentityUser
    {
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public FlagBoolean FlagDel { get; set; } = FlagBoolean.FALSE;
    }
}
