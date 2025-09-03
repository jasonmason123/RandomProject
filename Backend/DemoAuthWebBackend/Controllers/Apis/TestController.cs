using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DemoAuthWebBackend.Controllers.Apis
{
    [ApiController]
    [Authorize]
    [Route("api/test")]
    public class TestController : ControllerBase
    {
        [HttpGet("try-run")]
        public IActionResult TryRun()
        {
            return Ok();
        }
    }
}
