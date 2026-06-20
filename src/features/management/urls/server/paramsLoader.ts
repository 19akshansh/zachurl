import { createLoader } from "nuqs/server";
import { urlParams } from "../params";

export const urlParamsLoader = createLoader(urlParams);
