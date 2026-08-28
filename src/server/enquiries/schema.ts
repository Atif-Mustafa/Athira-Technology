import { z } from "zod";
import { ENQUIRY_PRIORITIES, ENQUIRY_STATUSES } from "./types";

export const ENQUIRY_PAGE_SIZE = 20;
export const MAX_ENQUIRY_PAGE = 1000;
export const MAX_ENQUIRY_SEARCH_LENGTH = 100;

export const enquiryIdSchema = z.string().uuid();
export const enquiryVersionSchema = z.coerce.number().int().positive();
export const enquiryStatusSchema = z.enum(ENQUIRY_STATUSES);
export const enquiryPrioritySchema = z.enum(ENQUIRY_PRIORITIES);
export const enquiryNoteSchema = z.string().trim().min(1, "Enter an internal note.").max(4000, "Notes must be 4,000 characters or fewer.");

export type EnquiryListParams = {
  query: string;
  status: "all" | (typeof ENQUIRY_STATUSES)[number];
  priority: "all" | (typeof ENQUIRY_PRIORITIES)[number];
  assignee: "all" | "unassigned" | string;
  sort: "newest" | "oldest";
  page: number;
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function normalizeEnquirySearch(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, MAX_ENQUIRY_SEARCH_LENGTH) : "";
}

export function parseEnquiryListParams(
  params: Record<string, string | string[] | undefined>,
): EnquiryListParams {
  const statusValue = first(params.status);
  const priorityValue = first(params.priority);
  const assigneeValue = first(params.assignee);
  const pageValue = first(params.page);
  const parsedPage = typeof pageValue === "string" && /^\d+$/.test(pageValue)
    ? Number.parseInt(pageValue, 10)
    : 1;

  return {
    query: normalizeEnquirySearch(first(params.q)),
    status: enquiryStatusSchema.safeParse(statusValue).success
      ? statusValue as EnquiryListParams["status"]
      : "all",
    priority: enquiryPrioritySchema.safeParse(priorityValue).success
      ? priorityValue as EnquiryListParams["priority"]
      : "all",
    assignee: assigneeValue === "unassigned" || enquiryIdSchema.safeParse(assigneeValue).success
      ? assigneeValue as EnquiryListParams["assignee"]
      : "all",
    sort: first(params.sort) === "oldest" ? "oldest" : "newest",
    page: Math.min(Math.max(parsedPage || 1, 1), MAX_ENQUIRY_PAGE),
  };
}
