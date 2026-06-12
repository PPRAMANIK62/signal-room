import postgres from "postgres";
import { apiEnv } from "../config/env";

type MigrationRow = {
  name: string;
};

const migrationsDirectory = new URL(
  "../../../../infra/db/migrations/",
  import.meta.url,
);

if (!apiEnv.databaseUrl) {
  console.error("DATABASE_URL is required to run database migrations.");
  process.exit(1);
}

const sql = postgres(apiEnv.databaseUrl, {
  max: 1,
  onnotice: () => {},
});

try {
  await ensureMigrationTable();
  const pendingMigrations = await listPendingMigrations();

  if (pendingMigrations.length === 0) {
    console.log("No pending database migrations.");
  }

  for (const migration of pendingMigrations) {
    await applyMigration(migration);
    console.log(`Applied database migration ${migration.name}`);
  }
} finally {
  await sql.end();
}

async function ensureMigrationTable() {
  await sql`
    create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `;
}

async function listPendingMigrations() {
  const appliedRows = await sql<MigrationRow[]>`
    select name
    from schema_migrations
  `;
  const applied = new Set(appliedRows.map((row) => row.name));
  const migrationFiles = await Array.fromAsync(
    new Bun.Glob("*.sql").scan({
      cwd: migrationsDirectory.pathname,
    }),
  );

  return migrationFiles
    .sort()
    .filter((name) => !applied.has(name))
    .map((name) => ({
      name,
      path: new URL(name, migrationsDirectory),
    }));
}

async function applyMigration(migration: { name: string; path: URL }) {
  const migrationSql = await Bun.file(migration.path).text();

  await sql.begin(async (transaction) => {
    await transaction.unsafe(migrationSql);
    await transaction`
      insert into schema_migrations (name)
      values (${migration.name})
    `;
  });
}
