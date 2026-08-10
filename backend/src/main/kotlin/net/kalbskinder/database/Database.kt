package net.kalbskinder.database

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import net.kalbskinder.config.DatabaseConfig
import net.kalbskinder.database.model.ProjectData
import org.slf4j.LoggerFactory
import java.sql.Timestamp

/**
 * Persists a [ProjectData] record for every finished build.
 */
class Database private constructor(private val dataSource: HikariDataSource) {

    private val logger = LoggerFactory.getLogger(Database::class.java)

    private fun initSchema() {
        dataSource.connection.use { conn ->
            conn.createStatement().use { stmt -> stmt.execute(CREATE_TABLE_SQL) }
        }
    }

    /** Store a single finished build. Never throws — failures are logged. */
    fun saveProjectData(data: ProjectData) {
        try {
            dataSource.connection.use { conn ->
                conn.prepareStatement(INSERT_SQL).use { stmt ->
                    stmt.setString(1, data.pluginName)
                    stmt.setString(2, data.pluginVersion)
                    stmt.setInt(3, data.codeLength.toIntOrNull() ?: 0)
                    stmt.setInt(4, data.configLength.toIntOrNull() ?: 0)
                    stmt.setBoolean(5, data.buildSuccess)
                    stmt.setString(6, data.buildErrors.joinToString(","))
                    stmt.setLong(7, data.buildDurationMs)
                    stmt.setTimestamp(8, Timestamp(data.timestamp))
                    stmt.executeUpdate()
                }
            }
            logger.debug("Persisted build record for '{}'", data.pluginName)
        } catch (e: Exception) {
            logger.error("Failed to persist build record for '{}'", data.pluginName, e)
        }
    }

    fun close() = dataSource.close()

    companion object {
        private val logger = LoggerFactory.getLogger(Database::class.java)

        private const val CREATE_TABLE_SQL = """
            CREATE TABLE IF NOT EXISTS build_records (
                id                BIGINT AUTO_INCREMENT PRIMARY KEY,
                plugin_name       VARCHAR(255) NOT NULL,
                plugin_version    VARCHAR(255) NOT NULL,
                code_length       INT          NOT NULL,
                config_length     INT          NOT NULL,
                build_success     BOOLEAN      NOT NULL,
                build_errors      VARCHAR(255) NOT NULL,
                build_duration_ms BIGINT       NOT NULL,
                created_at        TIMESTAMP    NOT NULL
            )
        """

        private const val INSERT_SQL = """
            INSERT INTO build_records
                (plugin_name, plugin_version, code_length, config_length,
                 build_success, build_errors, build_duration_ms, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """

        fun connect(config: DatabaseConfig): Database? = try {
            val hikari = HikariConfig().apply {
                jdbcUrl = config.jdbcUrl
                username = config.username
                password = config.password
                driverClassName = "com.mysql.cj.jdbc.Driver"
                maximumPoolSize = config.maxPoolSize
                poolName = "pluginwizard-db"
            }
            Database(HikariDataSource(hikari)).also {
                it.initSchema()
                logger.info("Connected to database at {}", config.jdbcUrl)
            }
        } catch (e: Exception) {
            logger.error(
                "Could not connect to database at {}; build records will not be persisted",
                config.jdbcUrl, e,
            )
            null
        }
    }
}
