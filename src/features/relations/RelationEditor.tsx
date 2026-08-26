import { useState } from "react";
import type { DependencyEdge, ScenarioDefinition } from "../../domain/types";

export interface RelationEditorProps {
  scenario: ScenarioDefinition;
  edges: readonly DependencyEdge[];
  onChange: (edges: readonly DependencyEdge[]) => void;
}

const sameEdge = (left: DependencyEdge, right: DependencyEdge) =>
  left.beforeTaskId === right.beforeTaskId && left.afterTaskId === right.afterTaskId;

export function RelationEditor({ scenario, edges, onChange }: RelationEditorProps) {
  const [beforeTaskId, setBeforeTaskId] = useState("");
  const [afterTaskId, setAfterTaskId] = useState("");
  const duplicate = edges.some((edge) => sameEdge(edge, { beforeTaskId, afterTaskId }));
  const invalidPair = !beforeTaskId || !afterTaskId || beforeTaskId === afterTaskId || duplicate;

  const addRelation = () => {
    if (invalidPair) return;
    onChange([...edges, { beforeTaskId, afterTaskId }]);
  };

  return (
    <form className="relation-editor" onSubmit={(event) => { event.preventDefault(); addRelation(); }}>
      <fieldset>
        <legend>관계 연결</legend>
        <label htmlFor="before-task">먼저 끝낼 작업</label>
        <select
          id="before-task"
          name="before-task"
          value={beforeTaskId}
          onChange={(event) => setBeforeTaskId(event.target.value)}
        >
          <option value="">작업을 선택하세요</option>
          {scenario.tasks.map((task) => <option key={task.id} value={task.id} disabled={task.id === afterTaskId}>{task.title}</option>)}
        </select>
        <label htmlFor="after-task">다음에 시작할 작업</label>
        <select
          id="after-task"
          name="after-task"
          value={afterTaskId}
          onChange={(event) => setAfterTaskId(event.target.value)}
        >
          <option value="">작업을 선택하세요</option>
          {scenario.tasks.map((task) => (
            <option key={task.id} value={task.id} disabled={task.id === beforeTaskId}>{task.title}</option>
          ))}
        </select>
        <p id="relation-editor-help">같은 작업을 양쪽에 고를 수 없고, 이미 연결한 관계는 다시 추가할 수 없습니다.</p>
        <button type="submit" disabled={invalidPair}>관계 연결</button>
      </fieldset>
    </form>
  );
}
