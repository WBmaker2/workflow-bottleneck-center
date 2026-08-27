import { useState } from "react";
import type { ScheduleDraft, ScheduleEntry, ScenarioDefinition } from "../../domain/types";
import { PlacementForm } from "./PlacementForm";
import { TimelineGrid } from "./TimelineGrid";
import { TimelineStepList } from "./TimelineStepList";

export interface ScheduleEditorProps {
  scenario: ScenarioDefinition;
  draft: ScheduleDraft;
  onChange(draft: ScheduleDraft): void;
  onMove?(taskId: string, plannedStart: number): void;
  showPlacementStatus?: boolean;
}

export function ScheduleEditor({ scenario, draft, onChange, onMove, showPlacementStatus = true }: ScheduleEditorProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");

  const place = (entry: ScheduleEntry) => {
    const withoutTask = draft.entries.filter((item) => item.taskId !== entry.taskId);
    setSelectedTaskId(entry.taskId);
    onChange({ ...draft, entries: [...withoutTask, entry] });
  };

  const deleteTask = (taskId: string) => {
    if (selectedTaskId === taskId) setSelectedTaskId(null);
    onChange({ ...draft, entries: draft.entries.filter((entry) => entry.taskId !== taskId) });
  };

  const moveTask = (taskId: string, plannedStart: number) => {
    const entry = draft.entries.find((item) => item.taskId === taskId);
    if (!entry) return;
    if (onMove) {
      onMove(taskId, plannedStart);
      return;
    }
    onChange({ ...draft, entries: draft.entries.map((item) => item.taskId === taskId ? { ...item, plannedStart } : item) });
  };

  return (
    <section className="schedule-editor" aria-labelledby="schedule-editor-title">
      <h3 id="schedule-editor-title">작업 배치</h3>
      <PlacementForm scenario={scenario} draft={draft} selectedTaskId={selectedTaskId} onPlace={place} showStatus={showPlacementStatus} />
      <div className="schedule-view-switcher" role="group" aria-label="일정 보기 방식">
        <button type="button" aria-pressed={view === "grid"} onClick={() => setView("grid")}>시간표 보기</button>
        <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>단계 목록 보기</button>
      </div>
      {view === "grid"
        ? <TimelineGrid scenario={scenario} entries={draft.entries} onMove={moveTask} onDelete={deleteTask} />
        : <TimelineStepList scenario={scenario} entries={draft.entries} />}
    </section>
  );
}
