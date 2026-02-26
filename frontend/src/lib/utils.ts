import { AxiosError } from "axios";

export const cn = (...classes: Array<string | undefined | null | false>) =>
  classes.filter(Boolean).join(" ");

export const getErrorMessage = (error: unknown, fallback = "Something went wrong") => {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    return message || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};
