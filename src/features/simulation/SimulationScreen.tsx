import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../a11y/usePrefersReducedMotion";
import { LiveStatus } from "../../components/LiveStatus";
import type { AttemptSnapshot, MissionAttempt } from "../../app/appTypes";
import type { ScenarioDefinition, WaitReason } from "../../domain/types";
import { BottleneckPrediction } from "./BottleneckPrediction";
import { SimulationControls } from "./SimulationControls";
import { SimulationTimeline } from "./SimulationTimeline";

export interface PlaybackState {
  currentTime: number;
  mode: "idle" | "playing" | "paused" | "complete";
  predictionRequired: boolean;
}

export interface SimulationScreenProps {
  scenario: ScenarioDefinition;
  snapshot: AttemptSnapshot;
  reducedMotion?: boolean;
  prediction?: WaitReason | null;
  predictionExplanation?: string;
  onSubmit?(reason: WaitReason, explanation: string): void;
  onEnterAnalysis?(): void;
}

export function SimulationScreen({ scenario, snapshot, reducedMotion: requestedReducedMotion, prediction = null, predictionExplanation = "", onSubmit, onEnterAnalysis }: SimulationScreenProps) {
  const mediaReducedMotion = usePrefersReducedMotion();
  const reducedMotion = requestedReducedMotion ?? mediaReducedMotion;
  const finishTime = snapshot.result.finishTime;
  const waits = snapshot.result.waits;
  const [playback, setPlayback] = useState<PlaybackState>({ currentTime: 0, mode: "idle", predictionRequired: false });
  const [localSubmittedReason, setLocalSubmittedReason] = useState<WaitReason | null>(null);
  const [submittedExplanation, setSubmittedExplanation] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const announcedEvents = useRef("");
  const announcedKinds = useRef(new Set<string>());
  const sessionSnapshot = useRef(snapshot);
  const sessionScenario = useRef(scenario);
  const skipAnnouncementAfterReset = useRef(false);
  const earliestWait = waits.reduce<typeof waits[number] | null>((earliest, wait) => {
    if (!earliest || wait.from < earliest.from) return wait;
    return earliest;
  }, null);

  useEffect(() => {
    if (sessionSnapshot.current === snapshot && sessionScenario.current === scenario) return;
    sessionSnapshot.current = snapshot;
    sessionScenario.current = scenario;
    skipAnnouncementAfterReset.current = true;
    announcedEvents.current = "";
    announcedKinds.current.clear();
    setLocalSubmittedReason(null);
    setSubmittedExplanation("");
    setAnnouncement("");
    setPlayback({ currentTime: 0, mode: "idle", predictionRequired: false });
  }, [scenario, snapshot]);

  const advance = useCallback(() => {
    setPlayback((previous) => {
      if ((!reducedMotion && previous.mode !== "playing") || previous.predictionRequired) return previous;
      if (previous.currentTime >= finishTime) return { ...previous, mode: "complete" };
      const predictionDone = prediction !== null || localSubmittedReason !== null;
      if (!predictionDone && earliestWait && previous.currentTime >= earliestWait.from) {
        return { currentTime: earliestWait.from, mode: "paused", predictionRequired: true };
      }
      const nextTime = previous.currentTime + 1;
      if (!predictionDone && earliestWait && earliestWait.from <= nextTime) {
        return { currentTime: earliestWait.from, mode: "paused", predictionRequired: true };
      }
      if (nextTime >= finishTime) return { currentTime: finishTime, mode: "complete", predictionRequired: false };
      return { currentTime: nextTime, mode: "playing", predictionRequired: false };
    });
  }, [earliestWait, finishTime, localSubmittedReason, prediction, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || playback.mode !== "playing" || playback.predictionRequired) return undefined;
    const timer = globalThis.setInterval(advance, 600);
    return () => globalThis.clearInterval(timer);
  }, [advance, playback.mode, playback.predictionRequired, reducedMotion, snapshot]);

  const play = () => {
    if (playback.predictionRequired) return;
    setPlayback((previous) => {
      if (previous.currentTime >= finishTime) return { ...previous, mode: "complete" };
      const predictionDone = prediction !== null || localSubmittedReason !== null;
      if (!predictionDone && earliestWait && earliestWait.from <= previous.currentTime) {
        return { ...previous, currentTime: earliestWait.from, mode: "paused", predictionRequired: true };
      }
      return { ...previous, mode: "playing" };
    });
  };

  const reset = () => {
    announcedEvents.current = "";
    announcedKinds.current.clear();
    setLocalSubmittedReason(null);
    setSubmittedExplanation("");
    setAnnouncement("");
    setPlayback({ currentTime: 0, mode: "idle", predictionRequired: false });
  };

  useEffect(() => {
    if (skipAnnouncementAfterReset.current) {
      skipAnnouncementAfterReset.current = false;
      return;
    }
    const starts = snapshot.result.runs.filter((run) => run.actualStart === playback.currentTime).map((run) => run.taskId);
    const finishes = snapshot.result.runs.filter((run) => run.end === playback.currentTime).map((run) => run.taskId);
    const waitsAtTime = waits.filter((wait) => wait.from === playback.currentTime);
    const eventKey = `${playback.currentTime}|${playback.mode}|${playback.predictionRequired}|${starts.join(",")}|${finishes.join(",")}|${waitsAtTime.map((wait) => `${wait.taskId}:${wait.from}:${wait.to}`).join(",")}`;
    if (eventKey === announcedEvents.current) return;
    announcedEvents.current = eventKey;
    const parts: string[] = [];
    const announceOnce = (key: string, message: string) => {
      if (announcedKinds.current.has(key)) return;
      announcedKinds.current.add(key);
      parts.push(message);
    };
    if (playback.mode !== "idle" && starts.length > 0) announceOnce(`start:${playback.currentTime}:${starts.join(",")}`, `${starts.map((id) => scenario.tasks.find((task) => task.id === id)?.title ?? id).join(", ")} 시작`);
    if (playback.mode !== "idle" && finishes.length > 0) announceOnce(`finish:${playback.currentTime}:${finishes.join(",")}`, `${finishes.map((id) => scenario.tasks.find((task) => task.id === id)?.title ?? id).join(", ")} 완료`);
    if (playback.mode !== "idle" && waitsAtTime.length > 0) announceOnce(`wait:${waitsAtTime.map((wait) => `${wait.taskId}:${wait.from}:${wait.to}`).join(",")}`, "기다림이 나타나 실행을 멈췄습니다.");
    if (playback.predictionRequired) announceOnce(`pause:${playback.currentTime}`, "실행이 일시 정지되었습니다.");
    if (playback.mode === "paused" && !playback.predictionRequired) announceOnce(`pause:${playback.currentTime}`, "실행이 일시 정지되었습니다.");
    if (playback.mode === "complete") announceOnce(`complete:${playback.currentTime}`, "가상 실행이 끝났습니다.");
    if (parts.length > 0) setAnnouncement(parts.join(" "));
  }, [playback, scenario.tasks, snapshot.result.runs, waits]);

  const submitPrediction = (reason: WaitReason, explanation: string) => {
    setLocalSubmittedReason(reason);
    setSubmittedExplanation(explanation);
    setPlayback((previous) => ({ ...previous, predictionRequired: false, mode: "paused" }));
    onSubmit?.(reason, explanation);
  };

  const submittedReason = waits.length > 0 ? prediction ?? localSubmittedReason : null;
  const currentWait = waits.find((wait) => wait.from === playback.currentTime) ?? null;
  const feedbackWait = currentWait ?? waits[0] ?? null;
  return (
    <section className="simulation-screen" aria-labelledby="simulation-screen-title" data-reduced-motion={reducedMotion ? "true" : "false"}>
      <h2 id="simulation-screen-title">가상 실행</h2>
      <p>미리 계산된 실행 기록을 시간 단위별로 살펴봅니다. 실제 작업 시간의 측정값이 아닙니다.</p>
      <SimulationTimeline scenario={scenario} snapshot={snapshot} currentTime={playback.currentTime} reducedMotion={reducedMotion} />
      <SimulationControls finishTime={finishTime} playback={playback} reducedMotion={reducedMotion} onPlay={play} onPause={() => setPlayback((previous) => ({ ...previous, mode: "paused" }))} onNext={advance} onReset={reset} />
      <LiveStatus message={announcement} />
      {playback.predictionRequired && currentWait && <BottleneckPrediction onSubmit={submitPrediction} />}
      {submittedReason && !playback.predictionRequired && (
        <BottleneckPrediction onSubmit={submitPrediction} submittedReason={submittedReason} submittedExplanation={predictionExplanation || submittedExplanation} engineReason={feedbackWait?.reason ?? null} />
      )}
      {((submittedReason && !playback.predictionRequired) || (waits.length === 0 && playback.mode === "complete")) && <button type="button" onClick={onEnterAnalysis}>분석으로 이동</button>}
      {submittedExplanation && <span className="visually-hidden">예측 설명이 저장되었습니다.</span>}
    </section>
  );
}

export type SimulationAttempt = Pick<MissionAttempt, "initialSnapshot" | "prediction" | "predictionExplanation">;
