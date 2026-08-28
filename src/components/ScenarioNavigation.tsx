import { scenarioCatalog } from "../data/scenarios";
import type { ScenarioId } from "../domain/types";

export interface ScenarioNavigationProps {
  selectedScenarioId: ScenarioId;
  onSelect(id: ScenarioId): void;
}

export function ScenarioNavigation({ selectedScenarioId, onSelect }: ScenarioNavigationProps) {
  return (
    <nav className="scenario-navigation no-print" aria-label="시나리오 선택">
      <ul>
        {scenarioCatalog.map((item) => {
          const selected = item.id === selectedScenarioId;
          return (
            <li key={item.id}>
              <button
                type="button"
                className={selected ? "scenario-navigation__button scenario-navigation__button--selected" : "scenario-navigation__button"}
                aria-current={selected ? "page" : undefined}
                style={{
                  backgroundColor: selected ? "#e4f0fb" : "#ffffff",
                  borderColor: selected ? "#2363a8" : "#9aa8b5",
                }}
                onClick={() => onSelect(item.id)}
              >
                <span>{item.title}</span>
                {selected && <span className="scenario-selection-status"> · 선택됨</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
