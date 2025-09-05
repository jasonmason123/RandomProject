using DemoAuthWebBackend.Utils.Enums;

namespace DemoAuthWebBackend.Entities.Interfaces
{
    public interface ISoftDeletable
    {
        FlagBoolean FlagDel { get; set; }
    }
}
