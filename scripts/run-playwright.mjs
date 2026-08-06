import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

const baseURL = "http://127.0.0.1:3100";
const healthUrl = `${baseURL}/api/health`;
const nextCli = fileURLToPath(
  new URL("../node_modules/next/dist/bin/next", import.meta.url),
);
const playwrightCli = fileURLToPath(
  new URL("../node_modules/@playwright/test/cli.js", import.meta.url),
);
const environment = {
  ...process.env,
  NEXT_PUBLIC_SITE_URL: baseURL,
};

async function isAthiraServerAvailable() {
  try {
    const response = await fetch(healthUrl);

    if (!response.ok) {
      return false;
    }

    const body = await response.json();
    return body?.status === "ok";
  } catch {
    return false;
  }
}

async function waitForServer(server) {
  const deadline = Date.now() + 60_000;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`The Playwright test server exited with code ${server.exitCode}.`);
    }

    if (await isAthiraServerAvailable()) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`The Playwright test server did not become ready at ${healthUrl}.`);
}

async function stopServer(server) {
  if (!server || server.exitCode !== null) {
    return;
  }

  server.kill("SIGTERM");

  const gracefulDeadline = Date.now() + 5_000;

  while (server.exitCode === null && Date.now() < gracefulDeadline) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  if (server.exitCode === null) {
    server.kill("SIGKILL");

    const forcedDeadline = Date.now() + 2_000;

    while (server.exitCode === null && Date.now() < forcedDeadline) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

if (!process.env.PLAYWRIGHT_SKIP_BUILD) {
  const build = spawnSync(process.execPath, [nextCli, "build"], {
    env: environment,
    stdio: "inherit",
  });

  if (build.status !== 0) {
    process.exit(build.status ?? 1);
  }
}

const reuseExistingServer = !process.env.CI && (await isAthiraServerAvailable());
const server = reuseExistingServer
  ? undefined
  : spawn(
      process.execPath,
      [nextCli, "start", "-p", "3100", "-H", "127.0.0.1"],
      {
        env: environment,
        stdio: "inherit",
      },
    );

let exitCode = 1;

try {
  if (server) {
    await waitForServer(server);
  }

  const playwright = spawn(
    process.execPath,
    [playwrightCli, "test", ...process.argv.slice(2)],
    {
      env: environment,
      stdio: "inherit",
    },
  );

  const [code] = await once(playwright, "exit");
  exitCode = typeof code === "number" ? code : 1;
} finally {
  await stopServer(server);
}

process.exit(exitCode);
