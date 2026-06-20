import { z } from "zod";

export const isAllowedDestinationUrl = (url: string) => {
  try {
    const protocol = new URL(url).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
};

export const destinationUrlSchema = z
  .url("Must be a valid URL")
  .refine(isAllowedDestinationUrl, {
    message: "Only http/https URLs are allowed",
  });
