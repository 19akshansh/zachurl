import { useQueryStates } from "nuqs";
import { urlParams } from "../params";

export const useUrlsParams = () => {
  return useQueryStates(urlParams);
};
