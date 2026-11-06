import { runCheck, type CheckRequest } from "./check-request.ts";

// A dedicated worker only hears from the page that started it, and those messages have no origin.
self.onmessage = ({ data, origin }: MessageEvent<CheckRequest>) => {
  if (origin !== "") return;
  self.postMessage(runCheck(data));
};
