document.getElementById("run").addEventListener("click", () => {
  const query = document.getElementById("query").value.trim();
  const output = document.getElementById("output");

  if (!query) {
    output.textContent = "Please type something.";
    return;
  }

  output.textContent = "Thinking...";

  chrome.runtime.sendMessage(
    { type: "RUN_QUERY", query },
    (response) => renderResponse(response)
  );
});


function renderResponse(res) {
  const output = document.getElementById("output");

  if (!res || res.error) {
    output.textContent = "Error: No response";
    return;
  }

  output.innerHTML = `
  <b>Best Match:</b><br>
  ${res.best_match.text}<br><br>

  <b>Score:</b> ${res.best_match.score}<br>
  <b>Source:</b> ${res.best_match.source}<br>
  <b>Planner Decision:</b> ${res.planner_decision}<br>
  <b>Fallback Used:</b> ${res.used_fallback_tool ? "Yes" : "No"}<br><br>

  <button id="traceBtn">Show Trace</button>
  <pre id="tracePanel" style="display:none; margin-top:10px;">${JSON.stringify(res.trace, null, 2)}</pre>
    `;

  document.getElementById("traceBtn").addEventListener("click", () => {
    const panel = document.getElementById("tracePanel");
    panel.style.display = panel.style.display === "none" ? "block" : "none";
  });
}
