function skeleton() {
  document.getElementById("totalPoints").innerText = "—";
  document.getElementById("anomalyCount").innerText = "—";
  document.getElementById("riskLevel").innerText = "—";
}

async function runAnalysis() {
  skeleton();

  const ticker = document.getElementById("ticker").value;
  document.getElementById("explanationText").innerText =
    "AI engine scanning intraday market microstructure…";

  const res = await fetch(
    `http://127.0.0.1:8000/analyze?ticker=${ticker}`
  );

  const data = await res.json();

  animateNumber("totalPoints", data.total_points);
  animateNumber("anomalyCount", data.anomaly_count);

  const risk =
    data.anomaly_count / data.total_points > 0.2
      ? "High"
      : "Moderate";

  document.getElementById("riskLevel").innerText = risk;
}

function animateNumber(id, value) {
  let el = document.getElementById(id);
  let i = 0;
  let step = Math.max(1, Math.floor(value / 30));

  let interval = setInterval(() => {
    i += step;
    if (i >= value) {
      el.innerText = value;
      clearInterval(interval);
    } else {
      el.innerText = i;
    }
  }, 20);
}
