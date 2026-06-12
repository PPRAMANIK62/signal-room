import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  RadioTower,
  RefreshCw,
  Server,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchHealth } from "@signal-room/api-client";
import type { HealthCheck, ServiceStatus } from "@signal-room/shared";
import { getWebEnv } from "@/lib/env";
import { cn } from "@/lib/utils";

type HealthState = {
  status: "loading" | "ready" | "degraded";
  api?: HealthCheck;
  signaling?: HealthCheck;
  checkedAt?: string;
  error?: string;
};

const env = getWebEnv();

export function App() {
  const [healthState, setHealthState] = useState<HealthState>({
    status: "loading",
  });

  async function checkHealth() {
    setHealthState((current) => ({
      ...current,
      status: current.api || current.signaling ? "degraded" : "loading",
    }));

    try {
      const health = await fetchHealth({
        apiUrl: env.apiUrl,
        signalingUrl: env.signalingUrl,
      });

      setHealthState({
        status: "ready",
        api: health.api,
        signaling: health.signaling,
        checkedAt: new Date().toISOString(),
      });
    } catch (error) {
      setHealthState((current) => ({
        ...current,
        status: "degraded",
        checkedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Health check failed",
      }));
    }
  }

  useEffect(() => {
    void checkHealth();
    const intervalId = window.setInterval(() => void checkHealth(), 10000);

    return () => window.clearInterval(intervalId);
  }, []);

  const services = useMemo(
    () => [
      {
        name: "HTTP API",
        role: "Control plane",
        icon: Server,
        health: healthState.api,
        fallbackStatus:
          healthState.status === "loading"
            ? ("checking" as const)
            : ("unreachable" as const),
      },
      {
        name: "Signaling gateway",
        role: "Realtime control path",
        icon: RadioTower,
        health: healthState.signaling,
        fallbackStatus:
          healthState.status === "loading"
            ? ("checking" as const)
            : ("unreachable" as const),
      },
    ],
    [healthState],
  );

  const overallStatus = getOverallStatus(healthState);

  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-zinc-800 pb-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-100">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Local room systems
            </div>
            <h1 className="text-balance text-3xl font-semibold text-white sm:text-5xl">
              Signal Room control plane readiness
            </h1>
            <p className="mt-3 max-w-2xl text-pretty text-base leading-7 text-zinc-300">
              A first operational surface for verifying that the API and
              signaling gateway are reachable before room, media, and meeting
              memory slices land.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void checkHealth()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-zinc-100 shadow-sm outline-none hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Refresh service health"
            disabled={healthState.status === "loading"}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Refresh
          </button>
        </header>

        <section className="grid flex-1 gap-5 py-5 lg:grid-cols-[1fr_360px]">
          <div className="grid content-start gap-5">
            <StatusBanner
              status={overallStatus}
              checkedAt={healthState.checkedAt}
              error={healthState.error}
            />

            <div className="grid gap-4 md:grid-cols-2">
              {services.map((service) => (
                <ServiceCard key={service.name} {...service} />
              ))}
            </div>

            <section className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg shadow-black/20">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Next vertical slice boundaries
                  </h2>
                  <p className="mt-1 text-pretty text-sm leading-6 text-zinc-400">
                    The scaffold keeps product behavior narrow while reserving
                    the core room surfaces and package boundaries.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  "Lobby readiness",
                  "Call room quality",
                  "Debug inspector",
                ].map((label) => (
                  <div
                    key={label}
                    className="rounded-md border border-zinc-800 bg-zinc-950 p-4"
                  >
                    <div className="text-sm font-medium text-zinc-100">
                      {label}
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-zinc-800">
                      <div className="h-2 w-1/3 rounded-full bg-cyan-300" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-white">Debug timeline</h2>
            <ol className="mt-5 space-y-4">
              <TimelineItem
                label="Workspace boot"
                detail="Bun workspace contracts loaded"
                tone="ready"
              />
              <TimelineItem
                label="Durable state"
                detail="Postgres compose service declared"
                tone="ready"
              />
              <TimelineItem
                label="Ephemeral state"
                detail="Redis compose service declared"
                tone="ready"
              />
              <TimelineItem
                label="Health probe"
                detail={
                  healthState.error ??
                  (healthState.checkedAt
                    ? "Latest health probe completed"
                    : "Waiting for first probe")
                }
                tone={
                  overallStatus === "ready"
                    ? "ready"
                    : overallStatus === "checking"
                      ? "checking"
                      : "failed"
                }
              />
            </ol>
          </aside>
        </section>
      </div>
    </main>
  );
}

function StatusBanner({
  status,
  checkedAt,
  error,
}: {
  status: "ready" | "checking" | "failed";
  checkedAt: string | undefined;
  error: string | undefined;
}) {
  const Icon =
    status === "ready"
      ? CheckCircle2
      : status === "checking"
        ? CircleDashed
        : AlertTriangle;

  return (
    <section
      className={cn(
        "rounded-lg border p-5 shadow-lg shadow-black/20",
        status === "ready" && "border-emerald-400/30 bg-emerald-400/10",
        status === "checking" && "border-zinc-700 bg-zinc-900",
        status === "failed" && "border-amber-400/30 bg-amber-400/10",
      )}
      aria-live="polite"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Icon className="mt-1 size-5 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold text-white">
              {status === "ready"
                ? "Ready for local development"
                : status === "checking"
                  ? "Checking services"
                  : "Service reachability is degraded"}
            </h2>
            <p className="mt-1 text-pretty text-sm leading-6 text-zinc-300">
              {error ??
                "The frontend is using the shared health contract to verify the API and signaling gateway."}
            </p>
          </div>
        </div>
        <div className="text-sm tabular-nums text-zinc-300">
          {checkedAt
            ? new Date(checkedAt).toLocaleTimeString()
            : "Not checked yet"}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  name,
  role,
  icon: Icon,
  health,
  fallbackStatus,
}: {
  name: string;
  role: string;
  icon: typeof Server;
  health: HealthCheck | undefined;
  fallbackStatus: "checking" | "unreachable";
}) {
  const status = health?.status ?? fallbackStatus;

  return (
    <article className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-md border border-zinc-700 bg-zinc-950">
            <Icon className="size-5 text-cyan-200" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-semibold text-white">{name}</h2>
            <p className="text-sm text-zinc-400">{role}</p>
          </div>
        </div>
        <StatusPill status={status} />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <Metric
          label="Control plane"
          value={health?.details.controlPlane ?? "checking"}
        />
        <Metric label="Version" value={health?.version ?? "pending"} />
        <Metric
          label="Durable state"
          value={health?.details.durableState ?? "not-connected"}
        />
        <Metric
          label="Ephemeral state"
          value={health?.details.ephemeralState ?? "not-connected"}
        />
      </dl>
    </article>
  );
}

function StatusPill({ status }: { status: ServiceStatus | "checking" }) {
  const Icon =
    status === "healthy"
      ? CheckCircle2
      : status === "checking"
        ? CircleDashed
        : WifiOff;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        status === "healthy" &&
          "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
        status === "checking" && "border-zinc-700 bg-zinc-950 text-zinc-200",
        status !== "healthy" &&
          status !== "checking" &&
          "border-amber-400/30 bg-amber-400/10 text-amber-100",
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {status}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950 p-3">
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="mt-1 truncate text-sm font-medium tabular-nums text-zinc-100">
        {value}
      </dd>
    </div>
  );
}

function TimelineItem({
  label,
  detail,
  tone,
}: {
  label: string;
  detail: string;
  tone: "ready" | "checking" | "failed";
}) {
  return (
    <li className="flex gap-3">
      <span
        className={cn(
          "mt-1 size-2.5 rounded-full",
          tone === "ready" && "bg-emerald-300",
          tone === "checking" && "bg-zinc-500",
          tone === "failed" && "bg-amber-300",
        )}
      />
      <div>
        <div className="text-sm font-medium text-zinc-100">{label}</div>
        <div className="mt-1 text-pretty text-sm leading-6 text-zinc-400">
          {detail}
        </div>
      </div>
    </li>
  );
}

function getOverallStatus(
  healthState: HealthState,
): "ready" | "checking" | "failed" {
  if (healthState.status === "loading") {
    return "checking";
  }

  if (
    healthState.api?.status === "healthy" &&
    healthState.signaling?.status === "healthy"
  ) {
    return "ready";
  }

  return "failed";
}
