import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "@/components/forms/ContactForm";

const successPayload = {
  ok: true,
  requestId: "contact_success",
  message: "Your enquiry was delivered to Athira Technology.",
};

function apiResponse(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function fillValidForm() {
  const user = userEvent.setup();
  await user.selectOptions(
    screen.getByLabelText(/Product or service interest/),
    "ai-software-engineer",
  );
  await user.type(screen.getByLabelText(/Full name/), "Ada Lovelace");
  await user.type(screen.getByLabelText(/Work email/), "ada@example.com");
  await user.type(screen.getByLabelText(/Company name/), "Analytical Engines Ltd");
  await user.type(
    screen.getByLabelText(/What problem are you trying to solve/),
    "We are evaluating a governed planning and testing workflow.",
  );
  await user.click(screen.getByRole("checkbox", { name: /I have read/ }));
  return user;
}

afterEach(() => vi.unstubAllGlobals());

describe("contact form", () => {
  it("associates visible labels, descriptions, and an unchecked required consent control", () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/Full name/)).toBeRequired();
    expect(screen.getByLabelText(/Work email/)).toHaveAttribute("aria-describedby", "workEmail-description");
    expect(screen.getByLabelText(/Company name/)).toBeRequired();
    expect(screen.getByLabelText(/Project stage/)).not.toBeRequired();
    expect(screen.getByLabelText(/Indicative project budget/)).not.toBeRequired();
    expect(screen.getByLabelText(/What problem are you trying to solve/)).toBeRequired();
    expect(screen.getByRole("checkbox", { name: /I have read/ })).toBeRequired();
    expect(screen.getByRole("checkbox", { name: /I have read/ })).not.toBeChecked();
  });

  it("shows associated client validation errors and focuses the summary without fetching", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactForm />);

    await userEvent.click(screen.getByRole("button", { name: "Send enquiry" }));

    const summary = await screen.findByRole("alert");
    expect(summary).toHaveFocus();
    expect(screen.getByLabelText(/Full name/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/Full name/)).toHaveAttribute("aria-describedby", "fullName-error");
    expect(screen.getByText("Enter your full name.")).toHaveAttribute("id", "fullName-error");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("announces loading, disables submission, and prevents duplicate requests", async () => {
    let resolveRequest!: (response: Response) => void;
    const fetchMock = vi.fn(
      () => new Promise<Response>((resolve) => { resolveRequest = resolve; }),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactForm />);
    const user = await fillValidForm();

    const submit = screen.getByRole("button", { name: "Send enquiry" });
    await user.click(submit);

    expect(await screen.findByRole("status")).toHaveTextContent(/Sending your enquiry securely/);
    expect(screen.getByRole("button", { name: /Sending enquiry/ })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /Sending enquiry/ }));
    expect(fetchMock).toHaveBeenCalledOnce();

    resolveRequest(apiResponse(successPayload, 202));
    expect(await screen.findByText("Enquiry delivered")).toBeVisible();
  });

  it.each([
    [429, "rate_limited", "Too many enquiries were submitted. Please wait before trying again."],
    [503, "configuration_unavailable", "Contact delivery is not configured. Please use the approved alternative."],
  ])("preserves fields after a %s recoverable failure", async (status, code, message) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        apiResponse({ ok: false, requestId: `contact_${status}`, code, message }, status),
      ),
    );
    render(<ContactForm />);
    const user = await fillValidForm();

    await user.click(screen.getByRole("button", { name: "Send enquiry" }));

    expect(await screen.findByText(message)).toBeVisible();
    expect(screen.getByRole("alert")).toHaveFocus();
    expect(screen.getByLabelText(/Full name/)).toHaveValue("Ada Lovelace");
    expect(screen.getByRole("checkbox", { name: /I have read/ })).toBeChecked();
  });

  it("renders server field errors with their controls", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        apiResponse(
          {
            ok: false,
            requestId: "contact_validation",
            code: "validation_error",
            message: "Check the highlighted fields and try again.",
            fieldErrors: { workEmail: ["Use an approved business email."] },
          },
          422,
        ),
      ),
    );
    render(<ContactForm />);
    const user = await fillValidForm();

    await user.click(screen.getByRole("button", { name: "Send enquiry" }));

    expect(await screen.findByText("Use an approved business email.")).toHaveAttribute(
      "id",
      "workEmail-error",
    );
    expect(screen.getByLabelText(/Work email/)).toHaveAttribute("aria-invalid", "true");
  });

  it("announces confirmed delivery and resets values only after success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(apiResponse(successPayload, 202)));
    render(<ContactForm />);
    const user = await fillValidForm();

    await user.click(screen.getByRole("button", { name: "Send enquiry" }));

    const status = await screen.findByRole("status");
    expect(status).toHaveFocus();
    expect(status).toHaveTextContent("Enquiry delivered");
    expect(status).toHaveTextContent("contact_success");
    await waitFor(() => expect(screen.getByLabelText(/Full name/)).toHaveValue(""));
    expect(screen.getByRole("checkbox", { name: /I have read/ })).not.toBeChecked();
  });
});
