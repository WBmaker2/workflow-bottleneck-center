import { assertScenarioDefinition } from "../../domain/scenarioValidation";
import type { ScenarioDefinition, ScenarioId } from "../../domain/types";
import { classPresentation } from "./classPresentation";
import { ecoCampaignBooth } from "./ecoCampaignBooth";
import { libraryCart } from "./libraryCart";
import { scienceDisplay } from "./scienceDisplay";

export const scenarioCatalog: readonly ScenarioDefinition[] = Object.freeze([
  scienceDisplay,
  libraryCart,
  classPresentation,
  ecoCampaignBooth,
]);

for (const scenario of scenarioCatalog) assertScenarioDefinition(scenario);

export function getScenario(id: ScenarioId): ScenarioDefinition {
  const scenario = scenarioCatalog.find((item) => item.id === id);
  if (!scenario) throw new Error(`Unknown scenario: ${id}`);
  return scenario;
}
