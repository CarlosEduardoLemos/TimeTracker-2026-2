using TimeTracker.Agent.Data;

namespace TimeTracker.Agent.Services;

public class AgentOrchestrator : IDisposable
{
    public string Username { get; }
    public string Hostname { get; }

    public IApiClient Api { get; }
    public LocalQueue Queue { get; }
    public SettingsPollingService Settings { get; }
    public CaptureService Capture { get; }
    public QueueSenderService Sender { get; }

    // true = último envio ao backend teve sucesso
    public bool IsOnline { get; private set; } = true;
    public event Action<bool>? OnlineStatusChanged;

    public AgentOrchestrator()
    {
        Username = MachineIdentityService.GetWindowsUsername();
        Hostname = MachineIdentityService.GetMachineName();

        Api = new HttpApiClient();

        Queue = new LocalQueue();
        Queue.Initialize();

        Settings = new SettingsPollingService(Api);
        Capture = new CaptureService(Queue, Settings, Username, Hostname);
        Sender = new QueueSenderService(Api, Queue);
        Sender.SendAttempted += success =>
        {
            if (success == IsOnline) return;
            IsOnline = success;
            OnlineStatusChanged?.Invoke(success);
        };
    }

    public void Start()
    {
        Settings.Start();
        Capture.Start();
        Sender.Start();
    }

    public int PendingCount() => Queue.CountPending();

    public void Dispose()
    {
        Capture.Dispose();
        Settings.Dispose();
        Sender.Dispose();
    }
}
