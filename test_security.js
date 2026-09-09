const runSecurityTests = async () => {
  console.log("=== STARTING SECURITY & JWT ENFORCEMENT TESTS ===");

  // Test 1: Access history with NO token
  const noTokenRes = await fetch("http://localhost:5000/api/v1/users/get_all_activity");
  console.log("1. History Request WITHOUT Token -> Status:", noTokenRes.status, "(Expected: 401)");
  const noTokenData = await noTokenRes.json();
  console.log("   Response Message:", noTokenData.message);

  // Test 2: Add activity with NO token
  const noTokenAddRes = await fetch("http://localhost:5000/api/v1/users/add_to_activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ meetingCode: "test-unauth-room" })
  });
  console.log("2. Add Activity WITHOUT Token -> Status:", noTokenAddRes.status, "(Expected: 401)");

  // Test 3: Access with FAKE / TAMPERED token
  const fakeTokenRes = await fetch("http://localhost:5000/api/v1/users/get_all_activity", {
    headers: { "Authorization": "Bearer fake_malicious_token_12345" }
  });
  console.log("3. History Request WITH FAKE Token -> Status:", fakeTokenRes.status, "(Expected: 401)");

  // Test 4: Register & Login for legitimate token
  const testUsername = "sec_user_" + Date.now();
  const regRes = await fetch("http://localhost:5000/api/v1/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Security Tester", username: testUsername, password: "password123" })
  });
  const regData = await reg.json();
  console.log("4. User Registration -> Status:", regRes.status, "| Token received:", Boolean(regData.token));

  // Test 5: Access WITH Valid JWT Token
  const validAddRes = await fetch("http://localhost:5000/api/v1/users/add_to_activity", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      "Authorization": "Bearer " + regData.token 
    },
    body: JSON.stringify({ meetingCode: "aur-secure-room-99" })
  });
  console.log("5. Add Activity WITH VALID Token -> Status:", validAddRes.status, "(Expected: 200)");

  const validGetRes = await fetch("http://localhost:5000/api/v1/users/get_all_activity", {
    headers: { "Authorization": "Bearer " + regData.token }
  });
  console.log("6. Get Activity WITH VALID Token -> Status:", validGetRes.status, "(Expected: 200)");
  const validData = await validGetRes.json();
  console.log("   Retrieved user meetings count:", validData.length);
  console.log("=== ALL SECURITY TESTS COMPLETED ===");
};

runSecurityTests();
