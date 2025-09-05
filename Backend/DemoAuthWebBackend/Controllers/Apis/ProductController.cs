using DemoAuthWebBackend.Controllers.DTOs.Entities;
using DemoAuthWebBackend.Entities;
using DemoAuthWebBackend.Repository._QueryParams;
using DemoAuthWebBackend.Repository._UoW;
using DemoAuthWebBackend.Utils.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpendingTracker_API.DTOs.Web_Mobile;

namespace DemoAuthWebBackend.Controllers.Apis
{
    [ApiController]
    //[Authorize]
    [Route("api/product")]
    public class ProductController(
        IAppUnitOfWork _appUnitOfWork    
    ) : ControllerBase
    {
        private readonly string INTERNAL_SERVER_ERROR_MESSSAGE = "Internal Server Error";

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                var item = await _appUnitOfWork.Products.GetByKeyAsync(id);

                return item != null ? Ok(item) : NotFound();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error api/product/{id}: {ex}");
                return StatusCode(500, INTERNAL_SERVER_ERROR_MESSSAGE);
            }
        }

        [HttpGet("list")]
        public IActionResult GetPagedList([FromQuery] ProductQueryParams queryParams)
        {
            try
            {
                var pagedList = _appUnitOfWork.Products
                    .GetPagedList(queryParams, x => new Product
                    {
                        Id = x.Id,
                        Name = x.Name,
                        Price = x.Price,
                        FlagDel = x.FlagDel,
                    });

                var pagedListResult = new PagedListResult<ProductDto>
                {
                    PageCount = pagedList.PageCount,
                    PageNumber = pagedList.PageNumber,
                    PageSize = pagedList.PageSize,
                    TotalItemCount = pagedList.TotalItemCount,
                    Items = pagedList
                            .Select(x => new ProductDto
                            {
                                Id = x.Id,
                                Name = x.Name,
                                Price = x.Price,
                                FlagDel = x.FlagDel
                            }).ToList(),
                };

                return Ok(pagedListResult);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error api/product/list: {ex}");
                return StatusCode(500, INTERNAL_SERVER_ERROR_MESSSAGE);
            }
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddAsync([FromBody] ProductDto productDto)
        {
            try
            {
                var product = new Product
                {
                    Name = productDto.Name,
                    Price = productDto.Price,
                    Description = productDto.Description,
                    CreatedAt = DateTime.UtcNow,
                    FlagDel = FlagBoolean.FALSE,
                };
                await _appUnitOfWork.Products.CreateAsync(product);
                await _appUnitOfWork.SaveChangesAsync();
                return Ok(product);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error api/product/add: {ex}");
                return StatusCode(500, INTERNAL_SERVER_ERROR_MESSSAGE);
            }
        }

        [HttpPatch("update/{id}")]
        public async Task<IActionResult> UpdateAsync(int id, [FromBody] ProductDto productDto)
        {
            try
            {
                var product = new Product
                {
                    Id = id,
                    Name = productDto.Name,
                    Price = productDto.Price,
                    Description = productDto.Description,
                    UpdatedAt = DateTime.UtcNow,
                };
                _appUnitOfWork.Products.Update(product);
                await _appUnitOfWork.SaveChangesAsync();
                return Ok(product);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error api/product/update: {ex}");
                return StatusCode(500, INTERNAL_SERVER_ERROR_MESSSAGE);
            }
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var product = new Product
                {
                    Id = id
                };
                _appUnitOfWork.Products.Delete(product);
                await _appUnitOfWork.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error api/product/delete/{id}: {ex}");
                return StatusCode(500, INTERNAL_SERVER_ERROR_MESSSAGE);
            }
        }
    }
}
