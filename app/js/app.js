const phaseText = document.getElementById('phaseText');
const detailText = document.getElementById('detailText');
const startBtn = document.getElementById('startBtn');
const pingValue = document.getElementById('pingValue');
const jitterValue = document.getElementById('jitterValue');
const downloadValue = document.getElementById('downloadValue');
const uploadValue = document.getElementById('uploadValue');

function setPhase(phase, detail='') {
  phaseText.textContent = phase;
  detailText.textContent = detail;
}

function median(arr) {
  const s = [...arr].sort((a,b) => a-b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m-1] + s[m]) / 2;
}

function percentile(arr, p) {
  const s = [...arr].sort((a,b) => a-b);
  const idx = Math.min(s.length - 1, Math.max(0, Math.ceil((p / 100) * s.length) - 1));
  return s[idx];
}

async function testPing() {
  const samples = [];
  for (let i = 0; i < 10; i++) {
    const start = performance.now();
    await fetch(`/api/ping?t=${Date.now()}_${i}`, { cache: 'no-store' });
    const end = performance.now();
    samples.push(end - start);
  }
  const med = median(samples);
  const diffs = [];
  for (let i = 1; i < samples.length; i++) diffs.push(Math.abs(samples[i] - samples[i - 1]));
  const jit = diffs.length ? median(diffs) : 0;
  pingValue.textContent = med.toFixed(1);
  jitterValue.textContent = jit.toFixed(1);
}

async function testDownload() {
  const sizes = [2, 4, 8, 12].map(mb => mb * 1024 * 1024);
  const speeds = [];
  for (const size of sizes) {
    const start = performance.now();
    const res = await fetch(`/api/download?bytes=${size}&t=${Date.now()}`, { cache: 'no-store' });
    const buf = await res.arrayBuffer();
    const end = performance.now();
    const mbps = (buf.byteLength * 8) / ((end - start) / 1000) / 1_000_000;
    speeds.push(mbps);
    downloadValue.textContent = mbps.toFixed(2);
  }
  downloadValue.textContent = percentile(speeds, 90).toFixed(2);
}

async function testUpload() {
  const sizes = [1, 2, 4, 6].map(mb => mb * 1024 * 1024);
  const speeds = [];
  for (const size of sizes) {
    const payload = crypto.getRandomValues(new Uint8Array(size > 65536 ? 65536 : size));
    const repeats = Math.ceil(size / payload.length);
    const chunks = [];
    for (let i = 0; i < repeats; i++) chunks.push(payload);
    const blob = new Blob(chunks, { type: 'application/octet-stream' });
    const start = performance.now();
    await fetch(`/api/upload?t=${Date.now()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream', 'Cache-Control': 'no-store' },
      body: blob
    });
    const end = performance.now();
    const mbps = (blob.size * 8) / ((end - start) / 1000) / 1_000_000;
    speeds.push(mbps);
    uploadValue.textContent = mbps.toFixed(2);
  }
  uploadValue.textContent = percentile(speeds, 90).toFixed(2);
}

startBtn.addEventListener('click', async () => {
  startBtn.disabled = true;
  try {
    setPhase('Ping', 'Measuring latency and jitter...');
    await testPing();
    setPhase('Download', 'Measuring download throughput...');
    await testDownload();
    setPhase('Upload', 'Measuring upload throughput...');
    await testUpload();
    setPhase('Complete', 'Test finished successfully.');
  } catch (err) {
    console.error(err);
    setPhase('Error', 'The test failed. Check deployment and try again.');
  } finally {
    startBtn.disabled = false;
  }
});
