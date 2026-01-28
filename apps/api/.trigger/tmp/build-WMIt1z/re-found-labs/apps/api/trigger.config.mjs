import {
  defineConfig
} from "../../../chunk-PWYC62E7.mjs";
import "../../../chunk-N6NY64LT.mjs";
import {
  init_esm
} from "../../../chunk-HNWWJ6GA.mjs";

// trigger.config.ts
init_esm();
var trigger_config_default = defineConfig({
  project: "proj_mdzorueyzbcotqvlcgdn",
  runtime: "node",
  logLevel: "log",
  // Required in v4: maximum duration for any task (5 minutes for our analysis)
  maxDuration: 300,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1e3,
      maxTimeoutInMs: 1e4,
      factor: 2,
      randomize: true
    }
  },
  dirs: ["./src/trigger"],
  build: {}
});
var resolveEnvVars = void 0;
export {
  trigger_config_default as default,
  resolveEnvVars
};
//# sourceMappingURL=trigger.config.mjs.map
