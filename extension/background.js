import { runAgent } from "./agent.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "RUN_QUERY") {
    const result = runAgent(message.query);
    sendResponse(result);
  }
});
