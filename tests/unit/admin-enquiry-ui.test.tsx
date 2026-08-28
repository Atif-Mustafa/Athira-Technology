import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EnquiryInboxList } from "@/components/admin/enquiries/EnquiryInboxList";

const params = {
  query: "",
  status: "all" as const,
  priority: "all" as const,
  assignee: "all" as const,
  sort: "newest" as const,
  page: 1,
};

describe("admin enquiry inbox", () => {
  it("renders hostile visitor content as inert text", () => {
    const message = '<script>alert(1)</script><img src=x onerror=alert(1)>';
    const { container } = render(
      <EnquiryInboxList
        params={params}
        result={{
          enquiries: [{
            id: "11111111-1111-4111-8111-111111111111",
            referenceCode: "ATH-ABCDEF1234",
            fullName: "Ada",
            workEmail: "ada@example.com",
            companyName: "Example",
            interest: "services",
            projectStage: null,
            budgetRange: null,
            message,
            status: "new",
            priority: "normal",
            assignedTo: null,
            assigneeName: null,
            notificationStatus: "failed",
            createdAt: "2026-08-28T00:00:00.000Z",
            updatedAt: "2026-08-28T00:00:00.000Z",
            firstReviewedAt: null,
            closedAt: null,
            version: 1,
          }],
          total: 1,
          page: 1,
          pageCount: 1,
          pageSize: 20,
        }}
      />,
    );

    expect(screen.getAllByText(message)).toHaveLength(2);
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getAllByText("Email notification failed")).toHaveLength(2);
  });
});
