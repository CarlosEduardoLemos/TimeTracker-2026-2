using TimeTracker.Agent.Services;

namespace TimeTracker.Agent.UI;

// ícone na System Tray
public class TrayApplicationContext : ApplicationContext
{
    private readonly AgentOrchestrator _orchestrator;
    private readonly NotifyIcon _trayIcon;
    private readonly ToolStripMenuItem _pauseResumeItem;

    private static readonly string NoticeAckPath = Path.Combine(
        Environment.GetFolderPath(
            Environment.SpecialFolder.LocalApplicationData
        ),
        "TimeTrackerAgent", "notice_ack.flag"
    );

    public TrayApplicationContext(AgentOrchestrator orchestrator)
    {
        _orchestrator = orchestrator;
        _orchestrator.OnlineStatusChanged += OnOnlineStatusChanged;

        ContextMenuStrip menu = new();
        ToolStripMenuItem statusItem = new(
            "Status", null, (_, _) => ShowStatus()
        );
        _pauseResumeItem = new ToolStripMenuItem(
            "Pausar monitoramento", null, (_, _) => TogglePause()
        );
        ToolStripMenuItem exitItem = new(
            "Sair", null, (_, _) => ExitApplication()
        );

        menu.Items.Add(statusItem);
        menu.Items.Add(_pauseResumeItem);
        menu.Items.Add(new ToolStripSeparator());
        menu.Items.Add(exitItem);

        _trayIcon = new NotifyIcon
        {
            Icon = SystemIcons.Application, // substituir por ícone próprio
            Text = "Time Tracker Agent",
            ContextMenuStrip = menu,
            Visible = true
        };
        _trayIcon.DoubleClick += (_, _) => ShowStatus();

        ShowFirstRunNoticeIfNeeded();

        _orchestrator.Start();
        _trayIcon.ShowBalloonTip(
            3000, "Time Tracker",
            "Agente iniciado e monitorando.", ToolTipIcon.Info
        );
    }

    private static void ShowFirstRunNoticeIfNeeded()
    {
        try
        {
            if (File.Exists(NoticeAckPath)) return;

            using FirstRunNoticeForm notice = new();
            notice.ShowDialog();

            Directory.CreateDirectory(Path.GetDirectoryName(NoticeAckPath)!);
            File.WriteAllText(NoticeAckPath, DateTime.UtcNow.ToString("O"));
        }
        catch
        {
            // Falha ao gravar o marcador não deve impedir o agente de iniciar;
            // na pior hipótese, o aviso reaparece na próxima execução.
        }
    }

    private void ShowStatus()
    {
        using StatusForm statusForm = new(_orchestrator);
        statusForm.ShowDialog();
    }

    private void TogglePause()
    {
        if (_orchestrator.Capture.IsPaused)
        {
            _orchestrator.Capture.Resume();
            _pauseResumeItem.Text = "Pausar monitoramento";
            _trayIcon.ShowBalloonTip(
                2000, "Time Tracker",
                "Monitoramento retomado.", ToolTipIcon.Info
            );
        }
        else
        {
            _orchestrator.Capture.Pause();
            _pauseResumeItem.Text = "Retomar monitoramento";
            _trayIcon.ShowBalloonTip(
                2000, "Time Tracker",
                "Monitoramento pausado.", ToolTipIcon.Warning
            );
        }
    }

    private void OnOnlineStatusChanged(bool isOnline)
    {
        _trayIcon.Text = (
            isOnline ?
            "Time Tracker Agent - conectado"
            : "Time Tracker Agent - falha de conexão"
        );

        if (!isOnline)
        {
            _trayIcon.ShowBalloonTip(
                4000, "Time Tracker",
                "Falha ao enviar dados ao servidor. " +
                "Os registros continuam sendo salvos localmente.",
                ToolTipIcon.Warning
            );
        }
    }

    private void ExitApplication()
    {
        _orchestrator.Dispose();

        _trayIcon.Visible = false;

        Application.Exit();
    }
}
