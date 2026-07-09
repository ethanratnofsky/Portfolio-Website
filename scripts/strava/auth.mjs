// One-time: mint a Strava refresh token for the importer.
// Usage:
//   1. Create an API app at https://www.strava.com/settings/api (callback domain: localhost)
//   2. Open (replace CLIENT_ID):
//      https://www.strava.com/oauth/authorize?client_id=CLIENT_ID&response_type=code&redirect_uri=http://localhost/exchange_token&approval_prompt=force&scope=activity:read_all
//   3. Approve; copy the `code` query param from the redirected URL.
//   4. Run: STRAVA_CLIENT_ID=.. STRAVA_CLIENT_SECRET=.. node scripts/strava/auth.mjs <code>
const [code] = process.argv.slice(2);
if (!code) { console.error("Usage: node scripts/strava/auth.mjs <authorization_code>"); process.exit(1); }
const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
    }),
});
if (!res.ok) { console.error(await res.text()); process.exit(1); }
const json = await res.json();
console.log("\nAdd these as GitHub Actions repository secrets:\n");
console.log("STRAVA_CLIENT_ID     =", process.env.STRAVA_CLIENT_ID);
console.log("STRAVA_CLIENT_SECRET = <your client secret>");
console.log("STRAVA_REFRESH_TOKEN =", json.refresh_token);
