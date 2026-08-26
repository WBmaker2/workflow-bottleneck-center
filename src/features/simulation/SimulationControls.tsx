import type { PlaybackState } from "./SimulationScreen";

export interface SimulationControlsProps {
  finishTime: number;
  playback: PlaybackState;
  reducedMotion: boolean;
  onPlay(): void;
  onPause(): void;
  onNext(): void;
  onReset(): void;
}

export function SimulationControls({ finishTime, playback, reducedMotion, onPlay, onPause, onNext, onReset }: SimulationControlsProps) {
  return (
    <div className="simulation-controls" aria-label="가상 실행 조작">
      {!reducedMotion && playback.mode !== "complete" && playback.mode !== "playing" && (
        <button type="button" onClick={onPlay}>가상 실행 시작</button>
      )}
      {!reducedMotion && playback.mode === "playing" && <button type="button" onClick={onPause}>일시 정지</button>}
      {reducedMotion && playback.mode !== "complete" && (
        <button type="button" onClick={onNext}>다음 단계</button>
      )}
      {(playback.mode === "paused" || playback.mode === "complete") && (
        <button type="button" onClick={onReset}>처음부터</button>
      )}
      <span aria-label="가상 실행 시간">{playback.currentTime} / {finishTime}단위</span>
    </div>
  );
}
