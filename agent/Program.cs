using TimeTracker.Agent.Services;
using TimeTracker.Agent.UI;

namespace TimeTracker.Agent;

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        ApplicationConfiguration.Initialize();

        // Garante instância única
        using Mutex singleInstanceMutex = new(
            true, "Global\\TimeTracker.Agent.SingleInstance",
            out bool isNewInstance
        );

        if (!isNewInstance)
        {
            MessageBox.Show(
                "O Time Tracker Agent já está em execução.", "Time Tracker",
                MessageBoxButtons.OK, MessageBoxIcon.Information
            );
            return;
        }

        AgentOrchestrator orchestrator = new();

        Application.Run(new TrayApplicationContext(orchestrator));
    }
}
