import { fileURLToPath } from "node:url";
import createJiti from "jiti";
const jiti = createJiti(fileURLToPath(import.meta.url));
jiti("./src/env");

import nextPWAConfig from "./next-pwa.config";

export default nextPWAConfig;
