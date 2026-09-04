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
    temp_profile = tempfile.mkdtemp(prefix="chrome_allied_test_")
    cmd = [
        CHROME_PATH,
        "--headless=new",
        f"--user-data-dir={temp_profile}",
        "--remote-debugging-port=0",
        "--remote-allow-origins=*",
        "--disable-gpu",
        "--no-sandbox",
        "--window-size=1440,1100",
        url
    ]
    proc = subprocess.Popen(cmd, stderr=subprocess.PIPE, text=True, bufsize=1)
    port = None
    for _ in range(50):
        line = proc.stderr.readline()
        if not line:
            time.sleep(0.1)
            continue
        if "DevTools listening on" in line:
            ws_url = line.split("DevTools listening on")[-1].strip()
            port = ws_url.split(":")[2].split("/")[0]
            break
    if not port:
        raise RuntimeError("Failed to capture Chrome DevTools port.")

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
        res = self.send("Page.captureScreenshot", {
            "format": "png",
            "captureBeyondViewport": True
        })
        filepath = os.path.join(SCREENSHOTS_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(base64.b64decode(res["data"]))
        return filepath

    def close(self):
        try:
            self.ws.close()
        except Exception:
            pass

def test_query_allied_in_browser(session, query_text, screenshot_name, expected_standard):
    print(f"\n" + "=" * 70)
    print(f"Browser UI Test: '{query_text[:60]}...'")
    print("=" * 70)

    # Set textarea value using React native setter
    session.evaluate(f"""
        const textarea = document.querySelector('textarea');
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        nativeSetter.call(textarea, {json.dumps(query_text)});
        textarea.dispatchEvent(new Event('input', {{ bubbles: true }}));
    """)
    time.sleep(0.4)

    # Click Recommend Standards button
    session.evaluate("""
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent.includes('Recommend Standards'));
        if (btn) btn.click();
    """)

    # Wait for results to render
    start_wait = time.time()
    rendered = False
    while time.time() - start_wait < 6.0:
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

    # Verify Card #1 Allied Standards section
    allied_analysis = session.evaluate("""
        const resultsHeader = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes('Applicable Indian Standards'));
        if (!resultsHeader) return { error: "No results header" };
        const section = resultsHeader.closest('section');
        const cards = Array.from(section.querySelectorAll('.grid > div'));
        
        if (cards.length === 0) return { error: "No cards found" };

        const card1 = cards[0];
        const card1Text = card1.innerText;
        
        // Find Allied Standards block in Card 1
        const alliedHeader = Array.from(card1.querySelectorAll('h5')).find(h => h.textContent.includes('Allied & Normative Standards'));
        const hasAlliedBlock = !!alliedHeader;

        // Extract chips in Card 1
        let chips = [];
        if (alliedHeader) {
            const alliedContainer = alliedHeader.closest('div.p-4');
            if (alliedContainer) {
                const chipEls = Array.from(alliedContainer.querySelectorAll('div[title]'));
                chips = chipEls.map(el => el.innerText.split('\\n').join(' '));
            }
        }

        // Check Card 2 and Card 3 for allied standards (should be absent)
        const otherCardsHaveAllied = cards.slice(1).map((c, i) => {
            const h = Array.from(c.querySelectorAll('h5')).find(h => h.textContent.includes('Allied & Normative Standards'));
            return { cardRank: i + 2, hasAllied: !!h };
        });

        const monoSpans = Array.from(card1.querySelectorAll('span.font-mono'));
        const stdSpan = monoSpans.find(s => s.innerText && s.innerText.startsWith('IS '));
        const card1Standard = stdSpan ? stdSpan.innerText : (monoSpans[1] ? monoSpans[1].innerText : "");

        return {
            card1_has_allied: hasAlliedBlock,
            card1_chips_count: chips.length,
            card1_chips: chips,
            card1_standard: card1Standard,
            other_cards: otherCardsHaveAllied,
            total_cards: cards.length
        };
    """)

    # Capture screenshot
    shot_path = session.screenshot(screenshot_name)

    print(f"Header Latency: {latency_text}")
    print(f"Card #1 Standard: {allied_analysis['card1_standard']}")
    print(f"Card #1 Has Allied Section: {allied_analysis['card1_has_allied']}")
    print(f"Card #1 Allied Chips Count: {allied_analysis['card1_chips_count']}")
    for c in allied_analysis['card1_chips']:
        print(f"   -> Chip: {c}")
    print(f"Other Cards Allied Check: {allied_analysis['other_cards']}")
    print(f"Screenshot saved: {shot_path}")

    # Assertions
    assert allied_analysis["card1_has_allied"], "Card #1 must have Allied & Normative Standards section!"
    assert allied_analysis["card1_chips_count"] > 0, "Card #1 must render allied standards chips!"
    assert all(not c["hasAllied"] for c in allied_analysis["other_cards"]), "Cards other than #1 must NOT have allied standards!"
    if expected_standard:
        assert expected_standard in allied_analysis["card1_standard"], f"Expected {expected_standard} in Card 1 standard, got {allied_analysis['card1_standard']}"

    return {
        "query": query_text,
        "latency": latency_text,
        "analysis": allied_analysis,
        "screenshot": shot_path
    }

def run_browser_tests():
    chrome_proc, ws_url, temp_profile = launch_chrome("http://127.0.0.1:5173/")
    test_results = []
    try:
        session = ChromeSession(ws_url)
        session.send("Page.enable")
        time.sleep(2)

        test_cases = [
            (
                "Procurement of heavy-duty PVC insulated and sheathed power cables for outdoor industrial distribution, 1.1kV rated voltage, multi-core copper conductor with steel wire armouring.",
                "allied_standards_card1_pvc.png",
                "IS 1554"
            ),
            (
                "Supply and delivery of 11 kV (E) grade, 3 core 185 sq mm compacted stranded aluminium conductor, crosslinked polyethylene (XLPE) insulated, extruded semi-conducting screen, galvanized steel strip armoured and outer PVC sheathed power cables.",
                "allied_standards_card1_xlpe_11kv.png",
                "IS 7098 (Part 2)"
            ),
            (
                "Supply of 70 sq.mm extra-flexible annealed copper conductor single core rubber elastomer insulated welding cables for manual metal arc welding machine connection, oil and heat resistant.",
                "allied_standards_card1_welding_cable.png",
                "IS 9857"
            )
        ]

        for q_text, img_name, expected_std in test_cases:
            res = test_query_allied_in_browser(session, q_text, img_name, expected_std)
            test_results.append(res)
            time.sleep(1)

        summary_file = os.path.join(SCREENSHOTS_DIR, "browser_allied_standards_summary.json")
        with open(summary_file, "w", encoding="utf-8") as f:
            json.dump(test_results, f, indent=2)

        print("\n" + "=" * 70)
        print("ALL BROWSER ALLIED STANDARDS UI TESTS PASSED SUCCESSFULLY!")
        print(f"Summary report written to {summary_file}")
        print("=" * 70)
        session.close()
    finally:
        chrome_proc.terminate()

if __name__ == "__main__":
    run_browser_tests()
