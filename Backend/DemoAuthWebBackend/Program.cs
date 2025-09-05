using DemoAuthWebBackend.Context;
using DemoAuthWebBackend.Entities;
using DemoAuthWebBackend.Infrastructure.AuthenticationService.OAuthAuthentication;
using DemoAuthWebBackend.Infrastructure.AuthenticationService.OtpAuthentication;
using DemoAuthWebBackend.Infrastructure.AuthTokenService;
using DemoAuthWebBackend.Infrastructure.NotificationService;
using DemoAuthWebBackend.Repository._UoW;
using DemoAuthWebBackend.Repository.ProductRepository;
using DemoAuthWebBackend.Utils;
using DemoAuthWebBackend.Utils.AuthTokenService;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using SpendingTracker_API.Authentication.OtpAuthentication;
using SpendingTracker_API.Authentication.PasswordAuthentication;
using System.Text;
using System.Text.Json.Serialization;

Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddScoped<IOtpAuth, EmailOtpAuth>();
builder.Services.AddScoped<IPasswordAuth, PasswordAuth>();
builder.Services.AddScoped<IOAuthAuthentication, OAuthAuthentication>();
builder.Services.AddScoped<IAuthTokenProvider, JwtProvider>();
builder.Services.AddScoped<INotificationSender, EmailSender>();
builder.Services.AddScoped<IAppUnitOfWork, AppUnitOfWork>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();

var jwtIssuer = builder.Configuration["JwtSettings:Issuer"];
var jwtAudience = builder.Configuration["JwtSettings:Audience"];
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    //Get jwt from cookie
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = ctx =>
        {
            ctx.Request.Cookies.TryGetValue(AppConstants.JWT_COOKIE_KEY, out var accessToken);
            if (!string.IsNullOrEmpty(accessToken))
                ctx.Token = accessToken;
            return Task.CompletedTask;
        },
    };

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable(EnvNames.JWT_SECRET_KEY) ?? ""))
    };
})
.AddCookie("External")
.AddGoogle(options =>
{
    options.ClientId = Environment.GetEnvironmentVariable(EnvNames.GOOGLE_CLIENT_ID) ?? "";
    options.ClientSecret = Environment.GetEnvironmentVariable(EnvNames.GOOGLE_CLIENT_SECRET) ?? "";
    options.SignInScheme = "External";
    options.Scope.Add("email");
    options.Scope.Add("profile");
    options.SaveTokens = true;
});
builder.Services.AddAuthorization();

builder.Services.Configure<CookiePolicyOptions>(options =>
{
    options.MinimumSameSitePolicy = SameSiteMode.None;
    options.Secure = CookieSecurePolicy.Always;
});

const string COMMON_POLICY_NAME = "CommonPolicy";
builder.Services.AddCors(options =>
{
    options.AddPolicy(COMMON_POLICY_NAME, policy =>
    {
        policy.WithOrigins("https://localhost:7058", "http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var connectionString = Environment.GetEnvironmentVariable(EnvNames.SQL_SERVER_CONNECTION_STRING);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddIdentityCore<AppUser>(options =>
{
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;

    options.User.RequireUniqueEmail = true;

    options.SignIn.RequireConfirmedEmail = true;
})
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddMemoryCache();
builder.Services.AddHttpContextAccessor();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCookiePolicy();

app.UseCors(COMMON_POLICY_NAME);

app.UseAuthentication();
app.UseAuthorization();

// Serve React app
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "app")),
    RequestPath = "" // serve from root
});

app.MapControllers();

var basesSkipServingReact = new[] { "/api" };

app.MapWhen(
    context => !basesSkipServingReact.Any(prefix => context.Request.Path.StartsWithSegments(prefix)),
    spa =>
    {
        spa.Run(async context =>
        {
            context.Response.ContentType = "text/html";
            await context.Response.SendFileAsync(
                Path.Combine(app.Environment.WebRootPath, "app", "index.html")
            );
        });
    }
);

app.Run();
