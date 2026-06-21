import { useQueryStates } from "nuqs";
import { qrParams } from "../params";

export const useQrsParams = () => {
  return useQueryStates(qrParams);
};
