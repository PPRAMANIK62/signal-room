import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Clock3,
  DoorOpen,
  Loader2,
  RadioTower,
  RefreshCw,
  Sparkles,
  Server,
  ShieldCheck,
  Video,
  WifiOff,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ApiValidationError,
  createRoom,
  fetchHealth,
} from "@signal-room/api-client";
import type { HealthCheck, Room, ServiceStatus } from "@signal-room/shared";
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

type CreateRoomState =
  | {
      status: "empty";
    }
  | {
      status: "submitting";
    }
  | {
      status: "success";
      room: Room;
    }
  | {
      status: "validation-error";
      message: string;
    }
  | {
      status: "api-error";
      message: string;
    };

export function App() {
  const [healthState, setHealthState] = useState<HealthState>({
    status: "loading",
  });
  const [roomTitle, setRoomTitle] = useState("");
  const [createRoomState, setCreateRoomState] = useState<CreateRoomState>({
    status: "empty",
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
  const trimmedRoomTitle = roomTitle.trim();
  const canSubmit =
    trimmedRoomTitle.length > 0 && createRoomState.status !== "submitting";

  async function handleCreateRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedRoomTitle) {
      setCreateRoomState({
        status: "validation-error",
        message: "Room title is required.",
      });
      return;
    }

    setCreateRoomState({ status: "submitting" });

    try {
      const response = await createRoom({
        apiUrl: env.apiUrl,
        request: {
          title: trimmedRoomTitle,
        },
      });

      setCreateRoomState({
        status: "success",
        room: response.room,
      });
    } catch (error) {
      if (error instanceof ApiValidationError) {
        setCreateRoomState({
          status: "validation-error",
          message: error.message,
        });
        return;
      }

      setCreateRoomState({
        status: "api-error",
        message:
          error instanceof Error
            ? error.message
            : "Room could not be created. Try again shortly.",
      });
    }
  }

  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-zinc-800 pb-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-sm font-medium text-teal-100">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Local room systems
            </div>
            <h1 className="text-balance text-3xl font-semibold text-white sm:text-5xl">
              Create a durable room from the lobby
            </h1>
            <p className="mt-3 max-w-2xl text-pretty text-base leading-7 text-zinc-300">
              Name a room, send it through the HTTP API, and see the
              PostgreSQL-backed room metadata return to the product surface.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void checkHealth()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-zinc-100 shadow-sm outline-none hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Refresh service health"
            disabled={healthState.status === "loading"}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Refresh
          </button>
        </header>

        <section className="grid flex-1 gap-5 py-5 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="grid content-start gap-5">
            <section className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg shadow-black/20">
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                <form onSubmit={handleCreateRoom} className="grid gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-teal-100">
                      <DoorOpen className="size-4" aria-hidden="true" />
                      Lobby entry
                    </div>
                    <h2 className="mt-2 text-balance text-2xl font-semibold text-white">
                      Start with a room title
                    </h2>
                    <p className="mt-2 max-w-2xl text-pretty text-sm leading-6 text-zinc-400">
                      This is the first durable room-state path across shared
                      schemas, typed client code, the HTTP API, and Postgres.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <label
                      htmlFor="room-title"
                      className="text-sm font-medium text-zinc-200"
                    >
                      Room title
                    </label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        id="room-title"
                        value={roomTitle}
                        onChange={(event) => {
                          setRoomTitle(event.target.value);
                          if (
                            createRoomState.status === "validation-error" ||
                            createRoomState.status === "api-error"
                          ) {
                            setCreateRoomState({ status: "empty" });
                          }
                        }}
                        placeholder="Weekly signal review"
                        className="h-11 min-w-0 flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-teal-300 focus:ring-2 focus:ring-teal-300/30"
                        maxLength={80}
                        aria-describedby="room-title-state"
                      />
                      <button
                        type="submit"
                        disabled={!canSubmit}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-teal-300 px-4 text-sm font-semibold text-zinc-950 shadow-sm outline-none hover:bg-teal-200 focus-visible:ring-2 focus-visible:ring-teal-100 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
                      >
                        {createRoomState.status === "submitting" ? (
                          <Loader2 className="size-4" aria-hidden="true" />
                        ) : (
                          <Video className="size-4" aria-hidden="true" />
                        )}
                        Create room
                      </button>
                    </div>
                    <RoomCreateFeedback state={createRoomState} />
                  </div>
                </form>

                <RoomMetadataPanel state={createRoomState} />
              </div>
            </section>

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
                      <div className="h-2 w-1/3 rounded-full bg-teal-300" />
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
              <TimelineItem
                label="Room creation"
                detail={getRoomTimelineDetail(createRoomState)}
                tone={
                  createRoomState.status === "success"
                    ? "ready"
                    : createRoomState.status === "submitting"
                      ? "checking"
                      : createRoomState.status === "api-error" ||
                          createRoomState.status === "validation-error"
                        ? "failed"
                        : "checking"
                }
              />
            </ol>
          </aside>
        </section>
      </div>
    </main>
  );
}

function RoomCreateFeedback({ state }: { state: CreateRoomState }) {
  const message =
    state.status === "validation-error" || state.status === "api-error"
      ? state.message
      : state.status === "submitting"
        ? "Creating room through the HTTP API."
        : state.status === "success"
          ? "Room created and returned by the API."
          : "Enter a title to create the first durable room.";

  return (
    <p
      id="room-title-state"
      className={cn(
        "min-h-6 text-pretty text-sm leading-6",
        state.status === "validation-error" || state.status === "api-error"
          ? "text-amber-200"
          : state.status === "success"
            ? "text-emerald-200"
            : "text-zinc-500",
      )}
      aria-live="polite"
    >
      {message}
    </p>
  );
}

function RoomMetadataPanel({ state }: { state: CreateRoomState }) {
  if (state.status === "success") {
    return (
      <aside className="rounded-md border border-emerald-400/30 bg-emerald-400/10 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-100">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          Created room
        </div>
        <dl className="mt-4 grid gap-3 text-sm">
          <MetadataRow label="Title" value={state.room.title} />
          <MetadataRow label="Room ID" value={state.room.id} />
          <MetadataRow label="Status" value={state.room.status} />
          <MetadataRow
            label="Created"
            value={new Date(state.room.createdAt).toLocaleString()}
          />
        </dl>
      </aside>
    );
  }

  if (state.status === "submitting") {
    return (
      <aside className="rounded-md border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-100">
          <Clock3 className="size-4" aria-hidden="true" />
          Creating room
        </div>
        <div className="mt-4 grid gap-3">
          <div className="h-10 rounded-md bg-zinc-900" />
          <div className="h-10 rounded-md bg-zinc-900" />
          <div className="h-10 rounded-md bg-zinc-900" />
        </div>
      </aside>
    );
  }

  return (
    <aside className="rounded-md border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-100">
        <Sparkles className="size-4 text-teal-200" aria-hidden="true" />
        No room created yet
      </div>
      <p className="mt-3 text-pretty text-sm leading-6 text-zinc-400">
        Created room metadata will appear here with the room ID, status, and
        creation time after the API responds.
      </p>
    </aside>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-md border border-emerald-400/20 bg-zinc-950/70 p-3">
      <dt className="text-xs text-emerald-100/70">{label}</dt>
      <dd className="truncate text-sm font-medium tabular-nums text-white">
        {value}
      </dd>
    </div>
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

function getRoomTimelineDetail(state: CreateRoomState) {
  if (state.status === "success") {
    return `Created ${state.room.title}`;
  }

  if (state.status === "submitting") {
    return "Waiting for API response";
  }

  if (state.status === "validation-error" || state.status === "api-error") {
    return state.message;
  }

  return "No room has been created yet";
}
