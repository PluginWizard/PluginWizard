package net.kalbskinder.plugin;

import lombok.Setter;
import net.kalbskinder.helpers.Helpers;
import net.kalbskinder.helpers.commands.CommandHelper;
import org.bukkit.Bukkit;
import org.bukkit.configuration.file.FileConfiguration;

// {userPluginImports}

import java.util.ArrayList;
import java.util.List;

public class UserPlugin {
    private final Plugin plugin;
    @Setter private FileConfiguration config;
// {userPluginFields}

    public UserPlugin(Plugin plugin) {
        this.plugin = plugin;
        this.config = plugin.getConfig();
// {userPluginFieldValues}
    }

    public void initialize() {
// {userPluginCode}
// {userPluginRegionEvents}
// {userPluginCommands}
    }

// {userPluginMethods}
}
