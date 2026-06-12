import type {
  CreateRoomRequest,
  HealthCheck,
  RoomMetadataResponse,
  ValidationIssue,
} from "@signal-room/shared";

export type ApiFetcher = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export type HealthClientOptions = {
  apiUrl: string;
  signalingUrl: string;
  fetcher?: ApiFetcher;
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
  fetcher: ApiFetcher,
  baseUrl: string,
  service: HealthTarget,
): Promise<HealthCheck> {
  const response = await fetcher(new URL("/health", baseUrl));

  if (!response.ok) {
    throw new Error(`${service} health check failed with ${response.status}`);
  }

  return response.json() as Promise<HealthCheck>;
}

export type CreateRoomClientOptions = {
  apiUrl: string;
  request: CreateRoomRequest;
  fetcher?: ApiFetcher;
};

export class ApiValidationError extends Error {
  readonly issues: ValidationIssue[];

  constructor(issues: ValidationIssue[]) {
    super(issues[0]?.message ?? "The request did not pass validation.");
    this.name = "ApiValidationError";
    this.issues = issues;
  }
}

export async function createRoom(
  options: CreateRoomClientOptions,
): Promise<RoomMetadataResponse> {
  const fetcher = options.fetcher ?? fetch;
  const response = await fetcher(new URL("/rooms", options.apiUrl), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(options.request),
  });

  if (response.status === 422 || response.status === 400) {
    const body = (await response.json()) as {
      issues?: ValidationIssue[];
    };

    throw new ApiValidationError(body.issues ?? []);
  }

  if (!response.ok) {
    throw new Error(`Room creation failed with ${response.status}`);
  }

  return response.json() as Promise<RoomMetadataResponse>;
}
