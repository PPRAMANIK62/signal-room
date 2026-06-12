import type { HealthCheck } from "@signal-room/shared";

export type HealthClientOptions = {
  apiUrl: string;
  signalingUrl: string;
  fetcher?: typeof fetch;
};

type HealthTarget = "api" | "signaling";

export async function fetchHealth(
  options: HealthClientOptions,
): Promise<Record<HealthTarget, HealthCheck>> {
  const fetcher = options.fetcher ?? fetch;
  const [api, signaling] = await Promise.all([
    fetchHealthTarget(fetcher, options.apiUrl, "api"),
    fetchHealthTarget(fetcher, options.signalingUrl, "signaling"),
  ]);

  return { api, signaling };
}

async function fetchHealthTarget(
  fetcher: typeof fetch,
  baseUrl: string,
  service: HealthTarget,
): Promise<HealthCheck> {
  const response = await fetcher(new URL("/health", baseUrl));

  if (!response.ok) {
    throw new Error(`${service} health check failed with ${response.status}`);
  }

  return response.json() as Promise<HealthCheck>;
}
