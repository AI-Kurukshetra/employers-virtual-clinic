import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { NextResponse } from "next/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ApiEnvelope<T = unknown> = {
  data: T | null;
  error: string | null;
  meta: Record<string, unknown>;
};

export function jsonOk<T>(data: T, meta: Record<string, unknown> = {}, status = 200) {
  return NextResponse.json<ApiEnvelope<T>>({ data, error: null, meta }, { status });
}

export function jsonError(error: string, status = 400, meta: Record<string, unknown> = {}) {
  return NextResponse.json<ApiEnvelope<null>>({ data: null, error, meta }, { status });
}
