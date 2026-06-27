import { useQueryStates } from "nuqs";
import { analyticsParams } from "../params";

export const useAnalyticsParams = () => {
  return useQueryStates(analyticsParams);
};
