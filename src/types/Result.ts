// Discriminated union for operation results
export type Result = 
  | { kind: "success"; data: string }
  | { kind: "error"; message: string };

// Helper functions for creating results
export const createSuccess = (data: string): Result => ({
  kind: "success",
  data
});

export const createError = (message: string): Result => ({
  kind: "error", 
  message
});

// Type guard functions
export const isSuccess = (result: Result): result is { kind: "success"; data: string } => 
  result.kind === "success";

export const isError = (result: Result): result is { kind: "error"; message: string } => 
  result.kind === "error";