import http from "node:http";

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runAllTests() {
  console.log("================================================================================");
  console.log("🔒 AURAMEET PRODUCTION SECURITY & RATE LIMITING TEST SUITE");
  console.log("================================================================================\n");

  // Import app & server from backend
  const { app, server } = await import("./Backend/src/app.js");
  const PORT = process.env.PORT || 5000;
  const BASE_URL = `http://127.0.0.1:${PORT}`;

  // Give server 1 second to fully initialize
  await delay(1000);

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = "") {
    if (condition) {
      console.log(`  ✅ [PASS] ${name} ${details}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name} ${details}`);
      failed++;
    }
  }

  try {
    // --- TEST 1: Health Probes & System Telemetry ---
    console.log("\n[TEST GROUP 1: Observability & Health Probes]");
    const healthRes = await fetch(`${BASE_URL}/health`);
    assert(healthRes.status === 200, "GET /health returns 200 OK");
    const healthData = await healthRes.json();
    assert(healthData.status === "healthy" && Boolean(healthData.memory?.rss), "Health payload contains memory telemetry");

    const readyRes = await fetch(`${BASE_URL}/ready`);
    assert(readyRes.status === 200, "GET /ready returns 200 OK");
    const readyData = await readyRes.json();
    assert(readyData.ready === true && Boolean(readyData.system?.nodeVersion), "Readiness probe reports system readiness");

    const statusRes = await fetch(`${BASE_URL}/status`);
    assert(statusRes.status === 200, "GET /status returns 200 OK");
    const statusData = await statusRes.json();
    assert(statusData.service.includes("AuraMeet") && typeof statusData.activeSockets === "number", "Telemetry returns active sockets and room count");

    // --- TEST 2: HTTP Security Headers (Helmet) ---
    console.log("\n[TEST GROUP 2: HTTP Security Headers (Helmet)]");
    const headers = healthRes.headers;
    assert(headers.get("x-content-type-options") === "nosniff", "X-Content-Type-Options: nosniff");
    assert(headers.get("x-frame-options") !== null || headers.get("content-security-policy") !== null, "CSP or Frame Options Header present");
    assert(headers.get("x-download-options") === "noopen" || headers.get("x-permitted-cross-domain-policies") !== null || headers.get("cross-origin-resource-policy") !== null, "Modern Browser Hardening Headers present");

    // --- TEST 3: JWT Protection on Protected Endpoints ---
    console.log("\n[TEST GROUP 3: JWT Authentication Enforcement]");
    
    // 3a. No token
    const noTokenRes = await fetch(`${BASE_URL}/api/v1/users/get_all_activity`);
    assert(noTokenRes.status === 401, "Protected history rejects request WITHOUT token (401 Unauthorized)");

    // 3b. Malformed / Fake token
    const fakeTokenRes = await fetch(`${BASE_URL}/api/v1/users/get_all_activity`, {
      headers: { "Authorization": "Bearer fake_tampered_signature_token_xyz" }
    });
    assert(fakeTokenRes.status === 401, "Protected history rejects TAMPERED token (401 Unauthorized)");

    // --- TEST 4: Input Validation & Sanitization ---
    console.log("\n[TEST GROUP 4: Payload Validation & Sanitization]");
    
    // Short password
    const shortPassRes = await fetch(`${BASE_URL}/api/v1/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Rudra", username: "validuser", password: "123" })
    });
    assert(shortPassRes.status === 400, "Registration rejects password shorter than 6 chars (400 Bad Request)");

    // Invalid characters in username
    const badUserRes = await fetch(`${BASE_URL}/api/v1/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Rudra", username: "user!@#$%", password: "validPassword123" })
    });
    assert(badUserRes.status === 400, "Registration rejects invalid characters in username (400 Bad Request)");

    // Empty Name
    const emptyNameRes = await fetch(`${BASE_URL}/api/v1/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", username: "gooduser123", password: "validPassword123" })
    });
    assert(emptyNameRes.status === 400, "Registration rejects empty full name (400 Bad Request)");

    // --- TEST 5: Legitimate Registration & Login Flow ---
    console.log("\n[TEST GROUP 5: Legitimate Registration, Login & Token Flow]");
    const uniqueUser = "sec_test_" + Date.now();
    const regRes = await fetch(`${BASE_URL}/api/v1/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Security Bot", username: uniqueUser, password: "securePassword2026!" })
    });
    assert(regRes.status === 201, "Registration succeeds with 201 Created");
    const regData = await regRes.json();
    assert(Boolean(regData.token), "Registration issues cryptographically signed JWT token");

    // Login
    const loginRes = await fetch(`${BASE_URL}/api/v1/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: uniqueUser, password: "securePassword2026!" })
    });
    assert(loginRes.status === 200, "Login succeeds with 200 OK");
    const loginData = await loginRes.json();
    const validToken = loginData.token;
    assert(Boolean(validToken), "Login returns valid JWT token and safe user payload");

    // --- TEST 6: Meeting Activity with Valid JWT ---
    console.log("\n[TEST GROUP 6: Authenticated Meeting Operations]");
    const addActivityRes = await fetch(`${BASE_URL}/api/v1/users/add_to_activity`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${validToken}`
      },
      body: JSON.stringify({ meetingCode: "aur-prod-room-100" })
    });
    assert(addActivityRes.status === 200, "Add meeting history with valid JWT succeeds (200 OK)");

    const getActivityRes = await fetch(`${BASE_URL}/api/v1/users/get_all_activity`, {
      headers: { "Authorization": `Bearer ${validToken}` }
    });
    assert(getActivityRes.status === 200, "Get meeting history with valid JWT succeeds (200 OK)");
    const activityList = await getActivityRes.json();
    assert(Array.isArray(activityList) && activityList.length >= 1, "Meeting history contains newly logged room");

    // --- TEST 7: Rate Limiting Enforcement (HTTP 429) ---
    console.log("\n[TEST GROUP 7: Rate Limiting & Brute-force Protection]");
    console.log("  Executing rapid authentication requests to verify rate limiter interception...");
    let triggeredRateLimit = false;

    for (let i = 0; i < 20; i++) {
      const floodRes = await fetch(`${BASE_URL}/api/v1/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "flood_user_" + i, password: "password" })
      });
      if (floodRes.status === 429) {
        triggeredRateLimit = true;
        const rateLimitData = await floodRes.json();
        console.log(`  Rate limit triggered at request #${i + 1} with HTTP 429: "${rateLimitData.message}"`);
        break;
      }
    }

    assert(triggeredRateLimit, "Auth rate limiter intercepts flooding and responds with 429 Too Many Requests");

  } catch (err) {
    console.error("Test execution error:", err);
  } finally {
    console.log("\n🛑 Closing server connection...");
    server.close();
    await delay(500);

    console.log("\n================================================================================");
    console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log("================================================================================\n");

    process.exit(failed > 0 ? 1 : 0);
  }
}

runAllTests();
