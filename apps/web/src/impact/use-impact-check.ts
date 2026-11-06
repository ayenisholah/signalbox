import type { SchemaChangeFailure, SchemaChangeReport } from "@traverse/graph-core";
import { useEffect, useRef, useState } from "react";
import type { CheckInput, CheckResponse } from "./check-request.ts";

export type ImpactState =
  | { status: "checking" }
  | { status: "done"; report: SchemaChangeReport | SchemaChangeFailure }
  | { status: "failed"; message: string };

const PAUSE_BEFORE_CHECK = 300;
const checking: ImpactState = { status: "checking" };

const toState = (response: CheckResponse): ImpactState =>
  "crash" in response
    ? { status: "failed", message: response.crash }
    : { status: "done", report: response.report };

/** Checks a draft in a worker, after typing pauses. Only the latest draft's answer counts. */
export const useImpactCheck = (input: CheckInput, createWorker: () => Worker): ImpactState => {
  const [answer, setAnswer] = useState<{ input: CheckInput; state: ImpactState } | null>(null);
  const worker = useRef<Worker>(null);
  const latest = useRef({ id: 0, input });

  useEffect(() => {
    const started = createWorker();
    worker.current = started;
    started.onmessage = ({ data }: MessageEvent<CheckResponse>) => {
      if (data.id === latest.current.id) {
        setAnswer({ input: latest.current.input, state: toState(data) });
      }
    };
    started.onerror = ({ message }) => {
      setAnswer({ input: latest.current.input, state: { status: "failed", message } });
    };
    return () => started.terminate();
  }, [createWorker]);

  useEffect(() => {
    const id = latest.current.id + 1;
    latest.current = { id, input };
    const timer = setTimeout(
      () => (worker.current as Worker).postMessage({ id, input }),
      PAUSE_BEFORE_CHECK,
    );
    return () => clearTimeout(timer);
  }, [input]);

  return answer?.input === input ? answer.state : checking;
};
