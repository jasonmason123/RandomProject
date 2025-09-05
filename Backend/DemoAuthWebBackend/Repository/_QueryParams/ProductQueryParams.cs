using DemoAuthWebBackend.Repository.QueryParams;
using DemoAuthWebBackend.Utils.Enums;

namespace DemoAuthWebBackend.Repository._QueryParams
{
    public class ProductQueryParams : BaseQueryParams
    {
        /// <summary>
        /// The indicator to mark deletion, used by entities that allow soft deletion.
        /// </summary>
        public FlagBoolean? FlagDel { get; set; }
    }
}
