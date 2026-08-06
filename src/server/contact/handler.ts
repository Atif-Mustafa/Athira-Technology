import type { ContactApiResponse } from "../../lib/contact/schema";
import {
  CONTACT_BODY_LIMIT_BYTES,
  contactSchema,
  flattenContactErrors,
} from "../../lib/contact/schema";
import {
  getContactServerConfig,
  type ContactServerConfig,
  type EnvironmentValidationResult,
} from "../env";
import {
  createContactEmailProvider,
  renderContactEmail,
  type ContactEmailProvider,
} from "./email";
import {
  logContactEvent,
  type ContactLogEvent,
  type ContactLogger,
  type ContactOutcome,
} from "./logging";
import {
  createContactRateLimiter,
  type ContactRateLimiter,
} from "./rate-limit";
import {
  createContactRequestId,
  getTrustedClientAddress,
  hashRateLimitIdentifier,
  isAllowedContactOrigin,
  readRequestBodyWithLimit,
} from "./request";

type ContactHandlerDependencies = {
  getConfig: () => EnvironmentValidationResult;
  createRateLimiter: (config: ContactServerConfig) => ContactRateLimiter;
  createEmailProvider: (config: ContactServerConfig) => ContactEmailProvider;
  createRequestId: () => string;
  logger: ContactLogger;
  now: () => number;
};

type HandlerState = Pick<
  ContactLogEvent,
  "validation" | "rateLimit" | "provider"
>;

const defaultDependencies: ContactHandlerDependencies = {
  getConfig: getContactServerConfig,
  createRateLimiter: createContactRateLimiter,
  createEmailProvider: createContactEmailProvider,
  createRequestId: createContactRequestId,
  logger: logContactEvent,
  now: Date.now,
};

function jsonResponse(
  body: ContactApiResponse,
  status: number,
  requestId: string,
  extraHeaders?: HeadersInit,
): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Request-ID": requestId,
      Vary: "Origin",
      ...Object.fromEntries(new Headers(extraHeaders).entries()),
    },
  });
}

export function createContactHandler(
  overrides: Partial<ContactHandlerDependencies> = {},
) {
  const dependencies = { ...defaultDependencies, ...overrides };
  let cachedLimiter: ContactRateLimiter | undefined;
  let cachedProvider: ContactEmailProvider | undefined;

  return async function handleContactPost(request: Request): Promise<Response> {
    const startedAt = dependencies.now();
    const requestId = dependencies.createRequestId();
    const state: HandlerState = {
      validation: "not_run",
      rateLimit: "not_run",
      provider: "not_run",
    };

    const finish = (
      outcome: ContactOutcome,
      body: ContactApiResponse,
      status: number,
      extraHeaders?: HeadersInit,
    ) => {
      dependencies.logger({
        timestamp: new Date(dependencies.now()).toISOString(),
        requestId,
        outcome,
        ...state,
        durationMs: Math.max(0, dependencies.now() - startedAt),
      });
      return jsonResponse(body, status, requestId, extraHeaders);
    };

    try {
      const contentType = request.headers
        .get("content-type")
        ?.split(";", 1)[0]
        ?.trim()
        .toLowerCase();

      if (contentType !== "application/json") {
        return finish(
          "unsupported_media_type",
          {
            ok: false,
            requestId,
            code: "invalid_request",
            message: "Submit the form using JSON.",
          },
          415,
        );
      }

      const declaredLength = Number(request.headers.get("content-length"));
      if (
        Number.isFinite(declaredLength) &&
        declaredLength > CONTACT_BODY_LIMIT_BYTES
      ) {
        return finish(
          "oversized",
          {
            ok: false,
            requestId,
            code: "payload_too_large",
            message: "The enquiry is too large to submit.",
          },
          413,
        );
      }

      const bodyRead = await readRequestBodyWithLimit(
        request,
        CONTACT_BODY_LIMIT_BYTES,
      );
      if (bodyRead.tooLarge) {
        return finish(
          "oversized",
          {
            ok: false,
            requestId,
            code: "payload_too_large",
            message: "The enquiry is too large to submit.",
          },
          413,
        );
      }

      let parsedBody: unknown;
      try {
        parsedBody = JSON.parse(bodyRead.body);
      } catch {
        return finish(
          "malformed",
          {
            ok: false,
            requestId,
            code: "invalid_request",
            message: "The request could not be read.",
          },
          400,
        );
      }

      const validation = contactSchema.safeParse(parsedBody);
      if (!validation.success) {
        state.validation = "rejected";
        return finish(
          "validation_rejected",
          {
            ok: false,
            requestId,
            code: "validation_error",
            message: "Check the highlighted fields and try again.",
            fieldErrors: flattenContactErrors(validation.error),
          },
          422,
        );
      }

      state.validation = "accepted";
      if (validation.data.website) {
        return finish(
          "honeypot_rejected",
          {
            ok: true,
            requestId,
            message: "Your enquiry has been accepted.",
          },
          202,
        );
      }

      const configResult = dependencies.getConfig();
      if (!configResult.success) {
        return finish(
          "configuration_unavailable",
          {
            ok: false,
            requestId,
            code: "configuration_unavailable",
            message:
              "Contact delivery is not configured. Please try an approved alternative contact channel.",
          },
          503,
        );
      }

      const config = configResult.config;
      if (!isAllowedContactOrigin(request, config)) {
        return finish(
          "origin_rejected",
          {
            ok: false,
            requestId,
            code: "invalid_request",
            message: "This submission could not be accepted.",
          },
          403,
        );
      }

      const address = getTrustedClientAddress(request, config);
      if (!address) {
        state.rateLimit = "unavailable";
        return finish(
          "rate_limit_unavailable",
          {
            ok: false,
            requestId,
            code: "service_unavailable",
            message: "Contact protection is temporarily unavailable. Please try again later.",
          },
          503,
        );
      }

      const rateLimitSecret = config.rateLimit.hashSecret;
      const identifier = hashRateLimitIdentifier(address, rateLimitSecret);
      cachedLimiter ??= dependencies.createRateLimiter(config);
      const rateLimit = await cachedLimiter.limit(identifier);

      if (!rateLimit.available) {
        state.rateLimit = "unavailable";
        return finish(
          "rate_limit_unavailable",
          {
            ok: false,
            requestId,
            code: "service_unavailable",
            message: "Contact protection is temporarily unavailable. Please try again later.",
          },
          503,
        );
      }

      if (!rateLimit.allowed) {
        state.rateLimit = "blocked";
        const retryAfter = Math.max(
          1,
          Math.ceil((rateLimit.resetAt - dependencies.now()) / 1000),
        );
        return finish(
          "rate_limited",
          {
            ok: false,
            requestId,
            code: "rate_limited",
            message: "Too many enquiries were submitted. Please wait before trying again.",
          },
          429,
          { "Retry-After": String(retryAfter) },
        );
      }

      state.rateLimit = "allowed";
      cachedProvider ??= dependencies.createEmailProvider(config);
      const submittedAt = new Date(dependencies.now()).toISOString();
      const message = renderContactEmail(
        validation.data,
        config,
        requestId,
        submittedAt,
      );
      const delivery = await cachedProvider.send(message);

      if (delivery.status === "rejected") {
        state.provider = "rejected";
        return finish(
          "provider_rejected",
          {
            ok: false,
            requestId,
            code: "delivery_failed",
            message: "The enquiry could not be delivered. Your form entries have been preserved.",
          },
          502,
        );
      }

      if (delivery.status === "unavailable") {
        state.provider = "unavailable";
        return finish(
          "provider_unavailable",
          {
            ok: false,
            requestId,
            code: "service_unavailable",
            message: "Contact delivery is temporarily unavailable. Please try again later.",
          },
          503,
        );
      }

      state.provider = "accepted";
      return finish(
        "accepted",
        {
          ok: true,
          requestId,
          message: "Your enquiry was delivered to Athira Technology.",
        },
        202,
      );
    } catch {
      return finish(
        "unexpected_failure",
        {
          ok: false,
          requestId,
          code: "unexpected_error",
          message: "An unexpected error prevented delivery. Please try again later.",
        },
        500,
      );
    }
  };
}
