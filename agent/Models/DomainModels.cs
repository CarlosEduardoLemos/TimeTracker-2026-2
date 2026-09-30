namespace TimeTracker.Agent.Models;

// Captura da janela ativa, pronta para envio ou fila
public class ActivitySample
{
    public string Username { get; set; } = "";
    public string Hostname { get; set; } = "";
    public string ProcessName { get; set; } = "";
    public string? WindowTitle { get; set; }
    public int DurationSeconds { get; set; }
    public bool IsIdle { get; set; }
    public DateTime CapturedAtUtc { get; set; }
}

// Configurações vindas de GET /config/
public class AgentSettings
{
    public int CaptureIntervalSeconds { get; set; } = 10;
    public int IdleTimeoutSeconds { get; set; } = 300;
}
