namespace TimeTracker.Agent.Dtos;

public class ActivityLogCreateDto
{
    public string Username { get; set; } = "";
    public string Hostname { get; set; } = "";
    public string ProcessName { get; set; } = "";
    public string? WindowTitle { get; set; }
    public int DurationSeconds { get; set; }
    public bool IsIdle { get; set; }
    public DateTime? CapturedAt { get; set; } // enviado como UTC (Kind=Utc) -> serializa com sufixo "Z"
}

public class SystemSettingsDto
{
    public int CaptureIntervalSeconds { get; set; } = 10;
    public int IdleTimeoutSeconds { get; set; } = 300;
    public DateTime? UpdatedAt { get; set; }
}
