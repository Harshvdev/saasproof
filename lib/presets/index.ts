import type { StartupReport } from "../types";
import { inspectSecondhandPreset } from "./inspect-secondhand";
import { dentalCompliancePreset } from "./dental-compliance";
import { creatorSponsorshipPreset } from "./creator-sponsorship";

export { inspectSecondhandPreset, dentalCompliancePreset, creatorSponsorshipPreset };

/**
 * Bundled high-fidelity demo presets for instantaneous cold-start exploration.
 */
export const DEMO_PRESETS: StartupReport[] = [
  inspectSecondhandPreset,
  dentalCompliancePreset,
  creatorSponsorshipPreset,
];
