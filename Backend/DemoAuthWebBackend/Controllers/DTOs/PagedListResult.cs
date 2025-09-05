namespace SpendingTracker_API.DTOs.Web_Mobile
{
    public class PagedListResult<TItemType> where TItemType : class
    {
        public decimal? TotalBudget { get; set; }
        public int TotalItemCount { get; set; }
        public int PageCount { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
        public IEnumerable<TItemType> Items { get; set; }
    }
}
