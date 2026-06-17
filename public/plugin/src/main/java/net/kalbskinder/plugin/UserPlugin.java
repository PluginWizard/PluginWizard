package net.kalbskinder.plugin;

import lombok.RequiredArgsConstructor;
import lombok.Setter;
import net.kalbskinder.helpers.Helpers;
import net.kalbskinder.helpers.commands.CommandHelper;
import net.kalbskinder.helpers.commands.CommandManager;
import org.bukkit.Bukkit;
import org.bukkit.configuration.file.FileConfiguration;

// {userPluginImports}

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
public class UserPlugin {
    private final CommandManager commandManager;
    private final Plugin plugin;
    @Setter private FileConfiguration config;
    private final List<CommandHelper> commands = new ArrayList<>();

    public void initialize() {
// {userPluginMethods}
// {userPluginCode}
// {userPluginRegionEvents}
// {userPluginCommands}
        commandManager.registerCommands(commands);
    }
}
