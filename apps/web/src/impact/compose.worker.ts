import { runCheck, type CheckRequest } from "./check-request.ts";

self.onmessage = ({ data }: MessageEvent<CheckRequest>) => {
  self.postMessage(runCheck(data));
};
