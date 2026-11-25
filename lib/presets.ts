import type { StartupReport } from "./types";
import { inspectSecondhandPreset } from "./presets/inspect-secondhand";
import { dentalCompliancePreset } from "./presets/dental-compliance";
import { creatorSponsorshipPreset } from "./presets/creator-sponsorship";

export {
  inspectSecondhandPreset,
  dentalCompliancePreset,
  creatorSponsorshipPreset,
};

export const DEMO_PRESETS: StartupReport[] = [
  inspectSecondhandPreset,
  dentalCompliancePreset,
  creatorSponsorshipPreset,
];
