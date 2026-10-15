package net.kalbskinder.plugin;

import lombok.RequiredArgsConstructor;
import lombok.Setter;
import net.kalbskinder.helpers.Helpers;
import net.kalbskinder.helpers.commands.CommandHelper;
import org.bukkit.Bukkit;
import org.bukkit.configuration.file.FileConfiguration;

// {userPluginImports}

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
public class UserPlugin {
    private final Plugin plugin;
    @Setter private FileConfiguration config;

    public void initialize() {
// {userPluginCode}
// {userPluginRegionEvents}
// {userPluginCommands}
    }

// {userPluginMethods}
}
