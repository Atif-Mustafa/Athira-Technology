import type { AppRole } from "../auth/roles";

export const ENQUIRY_STATUSES = ["new", "in_progress", "waiting", "resolved", "closed"] as const;
export const ENQUIRY_PRIORITIES = ["low", "normal", "high"] as const;
export const NOTIFICATION_STATUSES = ["pending", "sent", "failed"] as const;

export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];
export type EnquiryPriority = (typeof ENQUIRY_PRIORITIES)[number];
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

export type Enquiry = {
  id: string;
  referenceCode: string;
  fullName: string;
  workEmail: string;
  companyName: string;
  interest: string;
  projectStage: string | null;
  budgetRange: string | null;
  message: string;
  status: EnquiryStatus;
  priority: EnquiryPriority;
  assignedTo: string | null;
  assigneeName: string | null;
  notificationStatus: NotificationStatus;
  createdAt: string;
  updatedAt: string;
  firstReviewedAt: string | null;
  closedAt: string | null;
  version: number;
};

export type EnquiryNote = {
  id: string;
  enquiryId: string;
  authorUserId: string;
  authorName: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type EnquiryAuditEvent = {
  id: string;
  enquiryId: string;
  actorUserId: string | null;
  actorName: string;
  action: string;
  previousValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  createdAt: string;
};

export type AssignableStaff = {
  userId: string;
  displayName: string;
  role: Extract<AppRole, "admin" | "editor">;
};

export type EnquiryList = {
  enquiries: Enquiry[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
};

export type EnquiryCounts = {
  new: number;
  open: number;
  unassigned: number;
  notificationFailures: number;
};
