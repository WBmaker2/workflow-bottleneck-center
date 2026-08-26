import { useMemo, useState } from "react";
import type { ScheduleDraft, ScheduleEntry, ScenarioDefinition } from "../../domain/types";
import { isScheduleStart, normalizeScheduleRoleIds, scheduleStartUpperBound } from "../../domain/scheduleBounds";

export interface PlacementFormProps {
  scenario: ScenarioDefinition;
  draft: ScheduleDraft;
  selectedTaskId: string | null;
  onPlace(entry: ScheduleEntry): void;
}

export function PlacementForm({ scenario, draft, selectedTaskId, onPlace }: PlacementFormProps) {
  const [taskId, setTaskId] = useState(selectedTaskId ?? "");
  const [plannedStart, setPlannedStart] = useState("0");
  const [roleIds, setRoleIds] = useState<readonly ("A" | "B" | "C")[]>([]);
  const task = useMemo(() => scenario.tasks.find((item) => item.id === taskId), [scenario.tasks, taskId]);
  const alreadyPlaced = Boolean(task && draft.entries.some((entry) => entry.taskId === task.id));
  const selectedCount = roleIds.length;
  const remaining = task ? task.peopleRequired - selectedCount : 0;
  const valid = Boolean(task) && plannedStart !== "" && isScheduleStart(scenario, Number(plannedStart))
    && selectedCount === task?.peopleRequired;

  const selectTask = (nextTaskId: string) => {
    setTaskId(nextTaskId);
    setRoleIds([]);
    setPlannedStart("0");
  };

  const toggleRole = (roleId: "A" | "B" | "C") => {
    setRoleIds((current) => current.includes(roleId)
      ? current.filter((item) => item !== roleId)
      : current.length < (task?.peopleRequired ?? 0) ? [...current, roleId] : current);
  };

  const place = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!task || !valid) return;
    onPlace({ taskId: task.id, plannedStart: Number(plannedStart), roleIds: normalizeScheduleRoleIds(scenario, roleIds) });
  };

  return (
    <form className="placement-form" onSubmit={place} aria-labelledby="placement-title">
      <fieldset>
        <legend id="placement-title">작업 배치</legend>
        <label htmlFor="placement-task">배치할 작업</label>
        <select id="placement-task" name="placement-task" value={taskId} onChange={(event) => selectTask(event.target.value)}>
          <option value="">작업을 선택하세요</option>
          {scenario.tasks.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>

        <label htmlFor="placement-start">시작 시점</label>
        <select id="placement-start" name="placement-start" value={plannedStart} onChange={(event) => setPlannedStart(event.target.value)}>
          {Array.from({ length: scheduleStartUpperBound(scenario) + 1 }, (_, value) => <option key={value} value={value}>{value}단위</option>)}
        </select>

        {task && <p className="placement-requirements">{`이 작업에는 역할 ${task.peopleRequired}명이 필요합니다.`}</p>}
        {alreadyPlaced && <p>이미 배치한 작업입니다. 다시 배치하면 시작 시점과 역할을 교체합니다.</p>}
        <fieldset className="role-picker">
          <legend>담당 역할</legend>
          {scenario.roles.map((role) => (
            <label key={role.id}>
              <input
                type="checkbox"
                name="placement-role"
                value={role.id}
                checked={roleIds.includes(role.id)}
                disabled={!roleIds.includes(role.id) && selectedCount >= (task?.peopleRequired ?? 0)}
                onChange={() => toggleRole(role.id)}
              />
              {role.label}
            </label>
          ))}
        </fieldset>
        <p className="placement-resources">{task
          ? task.resources.length > 0
            ? `필요한 도구: ${task.resources.map((requirement) => scenario.resources.find((resource) => resource.id === requirement.resourceId)?.label ?? requirement.resourceId).join(", ")}. 작업 카드의 조건으로 정해져 있어 선택할 수 없습니다.`
            : "필요한 도구: 없음."
          : "작업을 선택하면 필요한 도구가 표시됩니다."}</p>
        <p id="placement-status" className="placement-status" role="status" aria-live="polite">
          {!task ? "작업을 선택하세요." : remaining > 0 ? `${remaining}명 더 선택하세요.` : "필요한 역할을 모두 선택했습니다."}
        </p>
        <button type="submit" disabled={!valid}>일정에 배치</button>
      </fieldset>
    </form>
  );
}
