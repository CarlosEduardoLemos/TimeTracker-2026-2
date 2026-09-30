namespace TimeTracker.Agent.Services;

public static class MachineIdentityService
{
    public static string GetWindowsUsername() => Environment.UserName;

    public static string GetMachineName() => Environment.MachineName;
}
