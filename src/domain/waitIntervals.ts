import type { WaitInterval } from "./types";

type Cause = Pick<WaitInterval, "taskId" | "reason" | "blockerTaskId" | "resourceId" | "roleId">;

const compareText = (left: string, right: string): number => (left < right ? -1 : left > right ? 1 : 0);

const sameCause = (left: WaitInterval, right: WaitInterval): boolean =>
  left.taskId === right.taskId &&
  left.reason === right.reason &&
  left.blockerTaskId === right.blockerTaskId &&
  left.resourceId === right.resourceId &&
  left.roleId === right.roleId;

const compareIntervals = (left: WaitInterval, right: WaitInterval): number => {
  const taskDifference = compareText(left.taskId, right.taskId);
  if (taskDifference !== 0) return taskDifference;
  if (left.from !== right.from) return left.from - right.from;
  if (left.to !== right.to) return left.to - right.to;
  const reasonDifference = compareText(left.reason, right.reason);
  if (reasonDifference !== 0) return reasonDifference;
  return compareText(JSON.stringify(left), JSON.stringify(right));
};

const cloneCause = (interval: WaitInterval): WaitInterval => {
  const cause: Cause = { taskId: interval.taskId, reason: interval.reason };
  if (interval.blockerTaskId !== undefined) cause.blockerTaskId = interval.blockerTaskId;
  if (interval.resourceId !== undefined) cause.resourceId = interval.resourceId;
  if (interval.roleId !== undefined) cause.roleId = interval.roleId;
  return { ...cause, from: interval.from, to: interval.to };
};

/** Return stable, minimal intervals for waits that have the same causal blocker. */
export function mergeWaitIntervals(intervals: readonly WaitInterval[]): readonly WaitInterval[] {
  const sorted = intervals
    .filter((interval) => Number.isInteger(interval.from) && Number.isInteger(interval.to) && interval.to > interval.from)
    .map(cloneCause)
    .sort(compareIntervals);
  const merged: WaitInterval[] = [];

  for (const interval of sorted) {
    const previous = merged[merged.length - 1];
    if (previous && previous.to === interval.from && sameCause(previous, interval)) {
      previous.to = interval.to;
    } else {
      merged.push(interval);
    }
  }
  return Object.freeze(merged.map((interval) => Object.freeze({ ...interval })));
}
