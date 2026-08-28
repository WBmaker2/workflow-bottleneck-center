import { useEffect, useRef, useState, type Dispatch } from "react";
import type { DependencyEdge, RelationValidation, ScenarioDefinition } from "../../domain/types";
import type { AppAction, MissionAttempt as AppMissionAttempt } from "../../app/appTypes";
import { validateRelationMap } from "../../domain/relationValidator";
import { LiveStatus } from "../../components/LiveStatus";
import { RelationBoard } from "./RelationBoard";
import { RelationEditor } from "./RelationEditor";
import { RequiredActionButton } from "../../components/RequiredActionButton";

export interface RelationScreenProps {
  scenario: ScenarioDefinition;
  attempt: Pick<AppMissionAttempt, "relationEdges">;
  onChange?: (edges: readonly DependencyEdge[]) => void;
  onContinue?: () => void;
  dispatch?: Dispatch<AppAction>;
}

const titleFor = (scenario: ScenarioDefinition, taskId: string) => scenario.tasks.find((task) => task.id === taskId)?.title ?? taskId;

const hasFinalConsonant = (value: string) => {
  const last = value.trim().charCodeAt(value.trim().length - 1);
  return last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0;
};

const missingMessage = (scenario: ScenarioDefinition, edge: DependencyEdge) =>
  `작업 카드에 공개된 관계를 다시 확인하세요: ${titleFor(scenario, edge.beforeTaskId)} 뒤에 ${titleFor(scenario, edge.afterTaskId)}${hasFinalConsonant(titleFor(scenario, edge.afterTaskId)) ? "을" : "를"} 시작합니다.`;

const validationMessages = (scenario: ScenarioDefinition, validation: RelationValidation) => {
  const messages: string[] = [];
  if (validation.unknown.length) messages.push("알 수 없는 작업을 포함해 관계를 확인해야 합니다.");
  if (validation.duplicate.length) messages.push("같은 관계가 두 번 있어 하나만 남겨야 합니다.");
  if (validation.cycleTaskIds.length) messages.push("작업이 서로를 기다리는 순환 관계라 확인해야 합니다.");
  messages.push(...validation.missingRequired.map((edge) => missingMessage(scenario, edge)));
  return messages;
};

export function RelationScreen({ scenario, attempt, onChange, onContinue, dispatch }: RelationScreenProps) {
  const edges = attempt.relationEdges;
  const validation = validateRelationMap(scenario, edges);
  const [announcement, setAnnouncement] = useState("");
  const listHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorSummaryRef = useRef<HTMLElement>(null);
  const previousCount = useRef(edges.length);
  const messages = validationMessages(scenario, validation);

  useEffect(() => {
    if (previousCount.current !== edges.length) {
      listHeadingRef.current?.focus();
      setAnnouncement(`관계 ${edges.length}개가 연결되어 있습니다.`);
      previousCount.current = edges.length;
    }
  }, [edges.length]);

  const addOrRemove = (nextEdges: readonly DependencyEdge[]) => {
    if (onChange) onChange(nextEdges);
    else dispatch?.({ type: "SET_RELATIONS", edges: nextEdges });
  };
  const continueToSchedule = () => {
    if (validation.status === "invalid") {
      errorSummaryRef.current?.focus();
      return;
    }
    if (onContinue) onContinue();
    else dispatch?.({ type: "ENTER_STAGE", stage: "schedule" });
  };

  return (
    <section className="relation-screen" aria-labelledby="relation-screen-title">
      <h2 id="relation-screen-title">관계 설계판</h2>
      <p>작업 카드를 읽고 먼저 끝낼 작업과 다음에 시작할 작업을 연결하세요. 함께 할 수 있는 작업은 연결하지 않아도 됩니다.</p>
      <div className="stage-layout">
        <div className="stage-workspace">
          <RelationEditor scenario={scenario} edges={edges} onChange={addOrRemove} />
          <LiveStatus message={announcement} />
          <RelationBoard scenario={scenario} edges={edges} validation={validation} listHeadingRef={listHeadingRef} onRemove={(edge, sourceIndex) => addOrRemove(edges.filter((item, index) => sourceIndex === undefined ? item.beforeTaskId !== edge.beforeTaskId || item.afterTaskId !== edge.afterTaskId : index !== sourceIndex))} />
        </div>
      </div>
      {messages.length > 0 && (
        <section ref={errorSummaryRef} className="relation-feedback" role="alert" tabIndex={-1} aria-labelledby="relation-feedback-title">
          <h3 id="relation-feedback-title">관계 확인 안내</h3>
          <ul>{messages.map((message) => <li key={message}>{message}</li>)}</ul>
        </section>
      )}
      {validation.status === "valid-with-extra" && (
        <p className="relation-extra-feedback">학생이 추가한 관계는 안전하지만 기다림이 늘어날 수 있습니다. 필요하다면 삭제하고 흐름을 비교해 보세요.</p>
      )}
      <RequiredActionButton actionId="confirm-relations" activeActionId="confirm-relations" onClick={continueToSchedule}>관계 확인</RequiredActionButton>
    </section>
  );
}
