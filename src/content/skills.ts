/** Catalog-facing skill module. Canonical data lives in jobs.ts (sim-safe). */
export { CATALOG_SKILL_IDS, JOBS, BASE_JOBS, SKILLS, skillsForJob, tooltipFor } from "./jobs";
export type { JobDef, SkillDef } from "./jobs";
export type { JobId } from "../core/types";
