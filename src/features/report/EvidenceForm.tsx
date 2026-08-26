import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { MissionAttempt } from "../../app/appTypes";
import type { ScenarioDefinition } from "../../domain/types";
import { isEvidenceComplete } from "../../domain/teacherSummary";

const strategies = ["순서 바꾸기", "동시에 하기", "도구 사용 순서 바꾸기", "도움 요청하기", "역할 교대하기", "확인·휴식 유지하기"] as const;
const dependencyReasons = ["품질을 확인하기 위해서", "필요한 자료를 준비하기 위해서", "앞 작업의 결과가 필요해서"] as const;
const parallelReasons = ["선행 조건과 도구가 겹치지 않아서", "서로 다른 역할로 진행할 수 있어서", "두 작업이 서로를 기다리지 않아서"] as const;
const changes = ["줄어들었", "늘어났", "같았"] as const;

type EvidenceField = keyof MissionAttempt["evidence"];
type FormState = {
  dependencyBefore: string; dependencyAfter: string; dependencyReason: string; dependencyText: string;
  parallelFirst: string; parallelSecond: string; parallelReason: string; parallelText: string;
  bottleneckFindingId: string; bottleneckTaskId: string; bottleneckUnits: string; bottleneckText: string;
  tradeoffTask: string; tradeoffStrategy: string; tradeoffChange: string; tradeoffCondition: string; tradeoffText: string;
};

export interface EvidenceFormHandle { validateAndFocus(): boolean; }
export interface EvidenceFormProps {
  scenario: ScenarioDefinition;
  attempt: Pick<MissionAttempt, "evidence" | "selectedFindingId"> & Partial<Pick<MissionAttempt, "initialSnapshot" | "revisedSnapshot">>;
  onChange(field: EvidenceField, value: string): void;
}

const initialState = (attempt: EvidenceFormProps["attempt"], scenario: ScenarioDefinition): FormState => ({
  dependencyBefore: "", dependencyAfter: "", dependencyReason: "", dependencyText: "",
  parallelFirst: "", parallelSecond: "", parallelReason: "", parallelText: "",
  bottleneckFindingId: attempt.selectedFindingId ?? "", bottleneckTaskId: attempt.initialSnapshot?.bottlenecks.findings.length === 0 ? scenario.tasks[0]?.id ?? "" : "", bottleneckUnits: attempt.initialSnapshot?.bottlenecks.findings.length === 0 ? "0" : "", bottleneckText: "",
  tradeoffTask: "", tradeoffStrategy: "", tradeoffChange: "", tradeoffCondition: "", tradeoffText: "",
});

const titleFor = (scenario: ScenarioDefinition, id: string) => scenario.tasks.find((task) => task.id === id)?.title ?? "";
const requiredPath = (scenario: ScenarioDefinition, from: string, to: string): boolean => {
  const seen = new Set<string>();
  const visit = (id: string): boolean => {
    if (id === to) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return scenario.tasks.find((task) => task.id === id)?.unlocks.some(visit) ?? false;
  };
  return visit(from);
};

const selectOptions = (scenario: ScenarioDefinition, includeEmpty = true) => <>
  {includeEmpty && <option value="">선택하세요</option>}
  {scenario.tasks.map((task) => <option value={task.id} key={task.id}>{task.title}</option>)}
</>;

export const EvidenceForm = forwardRef<EvidenceFormHandle, EvidenceFormProps>(function EvidenceForm({ scenario, attempt, onChange }, ref) {
  const [form, setForm] = useState(() => initialState(attempt, scenario));
  const [touched, setTouched] = useState<Record<EvidenceField, boolean>>({ dependencyExplanation: false, parallelExplanation: false, bottleneckExplanation: false, tradeoffExplanation: false });
  const persistedRef = useRef({ ...attempt.evidence });
  const [message, setMessage] = useState("");
  const findings = attempt.initialSnapshot?.bottlenecks.findings ?? [];

  useEffect(() => {
    for (const field of Object.keys(persistedRef.current) as EvidenceField[]) {
      if (!touched[field] && attempt.evidence[field].trim().length >= 10) persistedRef.current[field] = attempt.evidence[field];
    }
  }, [attempt.evidence, touched]);

  const dependencySentence = (value: FormState) => value.dependencyBefore && value.dependencyAfter && value.dependencyReason && value.dependencyText.trim()
    ? `${titleFor(scenario, value.dependencyBefore)} 작업이 끝나야 ${titleFor(scenario, value.dependencyAfter)} 작업을 시작할 수 있는 이유는 ${value.dependencyReason} ${value.dependencyText.trim()}.`
    : "";
  const parallelValid = (value: FormState) => value.parallelFirst && value.parallelSecond && value.parallelFirst !== value.parallelSecond
    && !requiredPath(scenario, value.parallelFirst, value.parallelSecond) && !requiredPath(scenario, value.parallelSecond, value.parallelFirst);
  const parallelSentence = (value: FormState) => parallelValid(value) && value.parallelReason && value.parallelText.trim()
    ? `${titleFor(scenario, value.parallelFirst)} 작업과 ${titleFor(scenario, value.parallelSecond)} 작업을 함께 할 수 있는 이유는 ${value.parallelReason} ${value.parallelText.trim()}.`
    : "";
  const selectedFinding = findings.find((finding) => finding.id === form.bottleneckFindingId);
  const bottleneckSentence = (value: FormState) => {
    const finding = findings.find((item) => item.id === value.bottleneckFindingId);
    const units = Number(value.bottleneckUnits);
    if (findings.length === 0) return value.bottleneckTaskId && units === 0 && value.bottleneckText.trim()
      ? `표시된 병목이 없기 때문에 ${titleFor(scenario, value.bottleneckTaskId)} 작업이 0단위 기다렸습니다. ${value.bottleneckText.trim()}.`
      : "";
    return finding && Number.isSafeInteger(units) && units === finding.delayUnits && value.bottleneckText.trim()
      ? `${finding.blockerLabel} 때문에 ${titleFor(scenario, finding.blockedTaskId)} 작업이 ${units}단위 기다렸습니다. ${value.bottleneckText.trim()}.`
      : "";
  };
  const tradeoffSentence = (value: FormState) => value.tradeoffTask && value.tradeoffStrategy && value.tradeoffChange && value.tradeoffCondition && value.tradeoffText.trim()
    ? `${titleFor(scenario, value.tradeoffTask)}을 바꾸어 시간/대기가 ${value.tradeoffChange}고, 안전·품질·역할 공정성은 ${value.tradeoffCondition}했습니다. ${value.tradeoffText.trim()}.`
    : "";

  const fieldForKey = (key: keyof FormState): EvidenceField => key.startsWith("dependency") ? "dependencyExplanation" : key.startsWith("parallel") ? "parallelExplanation" : key.startsWith("bottleneck") ? "bottleneckExplanation" : "tradeoffExplanation";
  const sentenceForField = (field: EvidenceField, value: FormState): string => field === "dependencyExplanation" ? dependencySentence(value) : field === "parallelExplanation" ? parallelSentence(value) : field === "bottleneckExplanation" ? bottleneckSentence(value) : tradeoffSentence(value);
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    const next = { ...form, [key]: value };
    setForm(next);
    const field = fieldForKey(key);
    setTouched((previous) => ({ ...previous, [field]: true }));
    const sentence = sentenceForField(field, next);
    onChange(field, sentence.trim().length >= 10 ? sentence : "");
  };

  const validateAndFocus = () => {
    const computed = { dependencyExplanation: dependencySentence(form).trim(), parallelExplanation: parallelSentence(form).trim(), bottleneckExplanation: bottleneckSentence(form).trim(), tradeoffExplanation: tradeoffSentence(form).trim() };
    const valueFor = (field: EvidenceField) => !touched[field] && persistedRef.current[field].trim().length >= 10 ? persistedRef.current[field].trim() : computed[field];
    const dependency = valueFor("dependencyExplanation");
    const parallel = valueFor("parallelExplanation");
    const bottleneck = valueFor("bottleneckExplanation");
    const tradeoff = valueFor("tradeoffExplanation");
    const values = { dependencyExplanation: dependency, parallelExplanation: parallel, bottleneckExplanation: bottleneck, tradeoffExplanation: tradeoff };
    const incomplete = (["dependencyExplanation", "parallelExplanation", "bottleneckExplanation", "tradeoffExplanation"] as EvidenceField[]).filter((field) => values[field].length < 10);
    if (incomplete.length > 0 || !isEvidenceComplete(values)) {
      setMessage("네 가지 근거 문장을 모두 완성하세요.");
      const textKey = incomplete[0]?.replace("Explanation", "Text") ?? "dependencyText";
      const target = document.querySelector<HTMLElement>(`[data-evidence-field="${textKey}"]`);
      target?.focus();
      return false;
    }
    for (const [field, sentence] of Object.entries(values) as [EvidenceField, string][]) if (touched[field]) onChange(field, sentence);
    setMessage("네 가지 근거 문장을 저장했습니다.");
    return true;
  };
  useImperativeHandle(ref, () => ({ validateAndFocus }));

  const taskSelect = (label: string, value: string, key: keyof FormState) => <label>{label}<select aria-label={label} value={value} onChange={(event) => update(key, event.target.value)}>{selectOptions(scenario)}</select></label>;
  const reasonSelect = (label: string, options: readonly string[], value: string, key: keyof FormState) => <label>{label}<select aria-label={label} value={value} onChange={(event) => update(key, event.target.value)}><option value="">선택하세요</option>{options.map((option) => <option value={option} key={option}>{option}</option>)}</select></label>;
  const reasoning = (label: string, value: string, key: keyof FormState) => <label>{label}<input data-evidence-field={key} type="text" maxLength={180} value={value} onChange={(event) => update(key, event.target.value)} /></label>;
  const saved = (field: EvidenceField) => !touched[field] && persistedRef.current[field].trim().length >= 10 ? <p className="evidence-persisted">저장된 근거 문장: {persistedRef.current[field]}</p> : null;

  return <section className="evidence-form" aria-labelledby="evidence-form-title">
    <h3 id="evidence-form-title">네 가지 근거 문장</h3>
    <p>선택한 조건과 짧은 설명으로 근거를 완성하세요.</p>
    <fieldset><legend>선행 관계 근거</legend><p>___ 작업이 끝나야 ___ 작업을 시작할 수 있는 이유는 ___입니다.</p>{saved("dependencyExplanation")}{taskSelect("선행 작업 선택", form.dependencyBefore, "dependencyBefore")}{taskSelect("시작 작업 선택", form.dependencyAfter, "dependencyAfter")}{reasonSelect("선행 이유 선택", dependencyReasons, form.dependencyReason, "dependencyReason")}{reasoning("선행 관계 설명", form.dependencyText, "dependencyText")}</fieldset>
    <fieldset><legend>병렬 관계 근거</legend><p>___ 작업과 ___ 작업을 함께 할 수 있는 이유는 ___입니다.</p>{saved("parallelExplanation")}{taskSelect("함께 할 첫 작업", form.parallelFirst, "parallelFirst")}{taskSelect("함께 할 둘째 작업", form.parallelSecond, "parallelSecond")}{reasonSelect("병렬 이유 선택", parallelReasons, form.parallelReason, "parallelReason")}{reasoning("병렬 관계 설명", form.parallelText, "parallelText")}{form.parallelFirst && form.parallelSecond && !parallelValid(form) && <p className="evidence-validation">필수 선행 경로가 있는 두 작업은 함께 할 수 없습니다.</p>}</fieldset>
    <fieldset><legend>병목 근거</legend><p>___ 때문에 ___ 작업이 ___단위 기다렸습니다.</p>{saved("bottleneckExplanation")}{findings.length === 0 ? <><p>이번 실행에는 표시된 병목과 기다림이 없습니다.</p>{taskSelect("기다림을 설명할 작업 선택", form.bottleneckTaskId, "bottleneckTaskId")}<p>표시된 기다림: 0단위</p><label>기다림 단위 선택<select aria-label="기다림 단위 선택" value={form.bottleneckUnits} onChange={(event) => update("bottleneckUnits", event.target.value)}><option value="0">0단위</option></select></label></> : <><label>병목 원인 선택<select aria-label="병목 원인 선택" value={form.bottleneckFindingId} onChange={(event) => update("bottleneckFindingId", event.target.value)}><option value="">선택하세요</option>{findings.map((finding) => <option key={finding.id} value={finding.id}>{finding.blockerLabel} · {titleFor(scenario, finding.blockedTaskId)}</option>)}</select></label>{selectedFinding && <p>표시된 실제 지연: {selectedFinding.delayUnits}단위</p>}<label>기다림 단위 선택<select aria-label="기다림 단위 선택" value={form.bottleneckUnits} onChange={(event) => update("bottleneckUnits", event.target.value)}><option value="">선택하세요</option>{Array.from({ length: Math.max(6, ...findings.map((finding) => finding.delayUnits + 2)) }, (_, index) => <option value={index} key={index}>{index}단위</option>)}</select></label></>}{reasoning("병목 근거 설명", form.bottleneckText, "bottleneckText")}</fieldset>
    <fieldset><legend>절충 근거</legend><p>___을 바꾸어 시간/대기가 ___했고, 안전·품질·역할 공정성은 ___했습니다.</p>{saved("tradeoffExplanation")}{taskSelect("바꾼 작업 선택", form.tradeoffTask, "tradeoffTask")}<label>수정 전략 선택<select aria-label="수정 전략 선택" value={form.tradeoffStrategy} onChange={(event) => update("tradeoffStrategy", event.target.value)}><option value="">선택하세요</option>{strategies.map((strategy) => <option value={strategy} key={strategy}>{strategy}</option>)}</select></label>{reasonSelect("시간/대기 변화 선택", changes, form.tradeoffChange, "tradeoffChange")}{reasonSelect("조건 결과 선택", ["지켰", "지키지 못했"], form.tradeoffCondition, "tradeoffCondition")}{reasoning("절충 근거 설명", form.tradeoffText, "tradeoffText")}</fieldset>
    <p role="alert" aria-live="polite">{message}</p>
    <button type="button" onClick={validateAndFocus}>근거 문장 확인</button>
  </section>;
});
