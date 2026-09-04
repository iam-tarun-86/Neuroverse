import subprocess
import time
import json
import urllib.request
import base64
import os
import sys
import tempfile
import websocket

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), "ui_screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

def launch_chrome(url="http://127.0.0.1:5173/"):
    temp_profile = tempfile.mkdtemp(prefix="chrome_test_")
    cmd = [
        CHROME_PATH,
        "--headless=new",
        f"--user-data-dir={temp_profile}",
        "--remote-debugging-port=0",
        "--remote-allow-origins=*",
        "--disable-gpu",
        "--no-sandbox",
        "--window-size=1440,900",
        url
    ]
    proc = subprocess.Popen(cmd, stderr=subprocess.PIPE, text=True, bufsize=1)
    port = None
    for _ in range(50):
        line = proc.stderr.readline()
        if not line:
            time.sleep(0.1)
            continue
        print("Chrome output:", line.strip())
        if "DevTools listening on" in line:
            ws_url = line.split("DevTools listening on")[-1].strip()
            # Parse port
            port = ws_url.split(":")[2].split("/")[0]
            break
    if not port:
        raise RuntimeError("Failed to capture Chrome DevTools port.")

    # Find page target
    time.sleep(1)
    req = urllib.request.urlopen(f"http://127.0.0.1:{port}/json")
    targets = json.loads(req.read().decode())
    page_target = next(t for t in targets if t.get("type") == "page")
    page_ws_url = page_target["webSocketDebuggerUrl"]

    return proc, page_ws_url, temp_profile

class ChromeSession:
    def __init__(self, ws_url):
        self.ws = websocket.create_connection(ws_url)
        self.msg_id = 0

    def send(self, method, params=None):
        self.msg_id += 1
        payload = {"id": self.msg_id, "method": method}
        if params:
            payload["params"] = params
        self.ws.send(json.dumps(payload))
        
        while True:
            resp = json.loads(self.ws.recv())
            if resp.get("id") == self.msg_id:
                return resp.get("result", {})

    def evaluate(self, expression):
        expr = f"(() => {{\n{expression}\n}})()"
        res = self.send("Runtime.evaluate", {
            "expression": expr,
            "returnByValue": True,
            "awaitPromise": True
        })
        if "exceptionDetails" in res:
            raise RuntimeError(f"JS Exception: {res['exceptionDetails']}")
        return res.get("result", {}).get("value")

    def screenshot(self, filename):
        res = self.send("Page.captureScreenshot", {"format": "png"})
        filepath = os.path.join(SCREENSHOTS_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(base64.b64decode(res["data"]))
        return filepath

    def close(self):
        try:
            self.ws.close()
        except Exception:
            pass

def run_query_in_browser(session, query_text, screenshot_name):
    print(f"\n==========================================")
    print(f"Running Query in Browser: '{query_text}'")
    print(f"==========================================")

    # Set textarea value using React native setter
    session.evaluate(f"""
        const textarea = document.querySelector('textarea');
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        nativeSetter.call(textarea, {json.dumps(query_text)});
        textarea.dispatchEvent(new Event('input', {{ bubbles: true }}));
    """)
    time.sleep(0.5)

    # Click Recommend Standards button
    session.evaluate("""
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent.includes('Recommend Standards'));
        if (btn) btn.click();
    """)

    # Wait for results to render
    start_wait = time.time()
    rendered = False
    while time.time() - start_wait < 5.0:
        is_done = session.evaluate("""
            const hasCards = document.querySelectorAll('.animate-fade-in-up').length > 0;
            const notProcessing = !document.querySelector('.animate-spin');
            return hasCards && notProcessing;
        """)
        if is_done:
            rendered = True
            break
        time.sleep(0.1)

    assert rendered, "Timed out waiting for recommendations to render!"

    # Extract latency
    latency_text = session.evaluate("""
        const header = Array.from(document.querySelectorAll('div')).find(d => d.innerText && d.innerText.includes('Standards Ranked'));
        return header ? header.innerText.replace(/\\n/g, ' ') : 'N/A';
    """)

    # Extract human review banner if present
    human_review_banner = session.evaluate("""
        const banner = Array.from(document.querySelectorAll('h4, div')).find(e => e.innerText && e.innerText.includes('Recommend Human Verification'));
        if (banner) {
            const container = banner.closest('.bg-amber-50');
            return container ? container.innerText.replace(/\\n/g, ' ') : banner.innerText;
        }
        return null;
    """)

    # Extract cards
    cards = session.evaluate("""
        const resultsHeader = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes('Applicable Indian Standards'));
        if (!resultsHeader) return [];
        const section = resultsHeader.closest('section');
        const cards = Array.from(section.querySelectorAll('.grid > div'));
        
        return cards.map(c => {
            const lines = c.innerText.split('\\n').map(s => s.trim()).filter(Boolean);
            return {
                raw_text: c.innerText,
                lines: lines
            };
        });
    """)

    # Take screenshot
    shot_path = session.screenshot(screenshot_name)
    print(f"Screenshot saved: {shot_path}")
    print(f"Observed UI Header Latency: {latency_text}")
    if human_review_banner:
        print(f"⚠️  Observed Human Review Banner: {human_review_banner}")
    print(f"Rendered Cards Count: {len(cards)}")
    for i, c in enumerate(cards):
        print(f"--- Card #{i+1} ---\n{c['raw_text']}\n")

    return {
        "query": query_text,
        "latency_text": latency_text,
        "human_review_banner": human_review_banner,
        "cards_count": len(cards),
        "cards": cards,
        "screenshot": shot_path
    }

def test_full_pipeline():
    chrome_proc, ws_url, temp_profile = launch_chrome("http://127.0.0.1:5173/")
    results_summary = []
    try:
        session = ChromeSession(ws_url)
        session.send("Page.enable")
        time.sleep(2)

        test_queries = [
            ("Supply of 70 sq.mm extra-flexible annealed copper conductor single core rubber elastomer insulated welding cables for manual metal arc welding machine connection, oil and heat resistant.", "query_10_corrected_ranking.png"),
            ("Tender for supply of 1.1 kV grade multi-core PVC insulated copper conductor power cables with steel wire armouring for coastal refinery substation, without specifying thermal operating rating.", "query_15_human_verification_banner.png"),
            ("PVC insulated cables for outdoor use, 1.1kV", "query_1_pvc_cables.png")
        ]

        for q_text, img_name in test_queries:
            res = run_query_in_browser(session, q_text, img_name)
            results_summary.append(res)
            time.sleep(1)

        summary_file = os.path.join(SCREENSHOTS_DIR, "browser_rules_test_summary.json")
        with open(summary_file, "w") as f:
            json.dump(results_summary, f, indent=2)
        print(f"\nAll queries verified successfully in browser! Summary saved to {summary_file}")
        session.close()
    finally:
        chrome_proc.terminate()

if __name__ == "__main__":
    test_full_pipeline()

