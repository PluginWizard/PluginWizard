package net.kalbskinder.plugin;

import lombok.extern.slf4j.Slf4j;
import net.kalbskinder.helpers.Helpers;
import net.kalbskinder.helpers.commands.CommandManager;
import net.kalbskinder.helpers.database.PluginDatabase;
import net.kalbskinder.helpers.database.Query;
import net.kalbskinder.helpers.regions.RegionManager;
import org.bukkit.Bukkit;
import org.bukkit.plugin.java.JavaPlugin;

import java.sql.SQLException;

@Slf4j
public final class Plugin extends JavaPlugin {
    private PluginDatabase database;
    private Query query;
    private final RegionManager regionManager = new RegionManager();

    private void setupDatabase() {
        try {
            this.database = new PluginDatabase(this.getDataFolder().getAbsolutePath() + "/database.db");
            this.query = new Query(database.getConnection());
        } catch (SQLException sqlException) {
            getLogger().severe("Failed to initialize database: " + sqlException.getMessage());
            Bukkit.getPluginManager().disablePlugin(this);
        }
    }

    // Yes, you could just remove these lines of code. But please keep this small advertisement.
    // It helps us grow PluginWizard faster and helps us to keep this project going.
    private void sendStartupMessage() {
        log.info("-----------------------------------------------------------------");
        log.info("");
        log.info("      Plugin {} was created using PluginWizard       ", this.getPluginMeta().getName());
        log.info("  Build Minecraft plugins using visual blocks in seconds!");
        log.info("       Check it out at: https://pluginwizard.net!");
        log.info("");
        log.info("-----------------------------------------------------------------");
    }

    @Override
    public void onEnable() {
        saveDefaultConfig();
        setupDatabase();
        sendStartupMessage();

        // command system
        CommandManager commandManager = new CommandManager(getLifecycleManager());

        // register helpers
        Helpers.initialize(this);

        UserPlugin userPlugin = new UserPlugin(commandManager, getConfig());
        userPlugin.initialize();
    }

    @Override
    public void onDisable() {
        try {
            database.close();
        } catch (SQLException sqlException) {
            getLogger().severe("Failed to close database: " + sqlException.getMessage());
        }
    }
}
