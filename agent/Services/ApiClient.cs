using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using TimeTracker.Agent.Config;
using TimeTracker.Agent.Dtos;

namespace TimeTracker.Agent.Services;

public interface IApiClient
{
    Task<SystemSettingsDto?> GetSettingsAsync(
        CancellationToken ct = default
    );
    Task SendActivityAsync(
        ActivityLogCreateDto log, CancellationToken ct = default
    );
}

public class HttpApiClient : IApiClient
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    private readonly HttpClient _http;
    private readonly ApiConfig _config;

    public HttpApiClient()
    {
        _config = AppConfig.Instance.Api;

        if (_config.RequireHttps
            && !_config.BaseUrl.StartsWith(
                "https://", StringComparison.OrdinalIgnoreCase
            ))
        {
            // comunicação Agente-API deve ser HTTPS em prod
            // opcional em appsettings.json (Api.RequireHttps) apenas
            // para testes contra o uvicorn (HTTP).
            throw new InvalidOperationException(
                "A URL base da API deve usar HTTPS "
                + "(ou defina Api.RequireHttps=false para testes locais)."
            );
        }

        _http = new HttpClient
        {
            BaseAddress = new Uri(_config.BaseUrl),
            Timeout = TimeSpan.FromSeconds(_config.TimeoutSeconds)
        };
    }

    public async Task<SystemSettingsDto?> GetSettingsAsync(
        CancellationToken ct = default
    )
    {
        Task<HttpResponseMessage> response;
        response = await _http.GetAsync(
            _config.Endpoints.GetSettings, ct
        );

        response.EnsureSuccessStatusCode();

        return await (
            response
            .Content
            .ReadFromJsonAsync<SystemSettingsDto>(JsonOptions, ct)
        );
    }

    public async Task SendActivityAsync(
        ActivityLogCreateDto log, CancellationToken ct = default
    )
    {
        Task<HttpResponseMessage> response;
        response = await _http.PostAsJsonAsync(
            _config.Endpoints.SendActivity, log, JsonOptions, ct
        );

        response.EnsureSuccessStatusCode(); // 201 Created se OK
    }
}
