using System.ComponentModel;

namespace DemoAuthWebBackend.Repository.QueryParams
{
    public class BaseQueryParams
    {
        /// <summary>
        /// The selected page.
        /// </summary>
        public int PageNumber { get; set; } = 1;
        /// <summary>
        /// The selected page size.
        /// </summary>
        public int PageSize { get; set; } = 10;
        /// <summary>
        /// The search string.
        /// </summary>
        public string? SearchTerm { get; set; }
        /// <summary>
        /// The property chosen to be sorted. This is derived from the entity's property names.
        /// </summary>
        public string? SortProperty { get; set; }
        /// <summary>
        /// The order to be sorted.
        /// </summary>
        public ListSortDirection? SortOrder { get; set; }
    }
}
