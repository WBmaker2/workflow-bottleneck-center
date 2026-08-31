import { scenarioCatalog } from "../data/scenarios";
import type { ScenarioId } from "../domain/types";

const scenarioNavigationCopy: Record<ScenarioId, string> = {
  "science-display": "프린터 1대·선행 관계",
  "library-cart": "확인 먼저·카트 1대",
  "class-presentation": "개별 준비·합동 연습",
  "eco-campaign-booth": "안전 통로·역할 교대",
};

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
                onClick={() => onSelect(item.id)}
              >
                <span className="scenario-navigation__title">{item.title}</span>
                <small className="scenario-navigation__meta">
                  <span className="scenario-navigation__constraint">{scenarioNavigationCopy[item.id]}</span>
                  {selected && <span className="scenario-navigation__status">선택됨</span>}
                </small>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
