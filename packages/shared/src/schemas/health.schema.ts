export type ServiceName = "api" | "signaling" | "web" | "worker";
export type ServiceStatus = "healthy" | "degraded" | "unreachable";

export type HealthCheck = {
  service: ServiceName;
  status: ServiceStatus;
  version: string;
  checkedAt: string;
  details: {
    controlPlane: "ready" | "starting";
    durableState: "not-connected" | "ready";
    ephemeralState: "not-connected" | "ready";
  };
};

export function createHealthCheck(service: ServiceName): HealthCheck {
  return {
    service,
    status: "healthy",
    version: "0.0.0",
    checkedAt: new Date().toISOString(),
    details: {
      controlPlane: "ready",
      durableState: "not-connected",
      ephemeralState: "not-connected",
    },
  };
}
