export interface StravaActivity {
    id: number;
    name: string;
    description: string;
    sport_type: string;
    start_date: string;
    start_date_local: string;
}
export interface StravaCreds {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
}

const BASE = "https://www.strava.com";

export async function refreshAccessToken(
    c: StravaCreds,
    fetchFn: typeof fetch = fetch
): Promise<string> {
    const res = await fetchFn(`${BASE}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            client_id: c.clientId,
            client_secret: c.clientSecret,
            grant_type: "refresh_token",
            refresh_token: c.refreshToken,
        }),
    });
    if (!res.ok)
        throw new Error(
            `Strava token refresh failed: ${res.status} ${await res.text()}`
        );
    const json = (await res.json()) as { access_token: string };
    return json.access_token;
}

export async function listActivitiesSince(
    token: string,
    afterEpoch: number,
    fetchFn: typeof fetch = fetch
): Promise<Array<{ id: number; sport_type: string; start_date: string }>> {
    const out: Array<{ id: number; sport_type: string; start_date: string }> =
        [];
    for (let page = 1; page <= 10; page++) {
        const url = `${BASE}/api/v3/athlete/activities?after=${afterEpoch}&per_page=100&page=${page}`;
        const res = await fetchFn(url, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok)
            throw new Error(
                `Strava list failed: ${res.status} ${await res.text()}`
            );
        const batch = (await res.json()) as Array<{
            id: number;
            sport_type: string;
            start_date: string;
        }>;
        out.push(...batch);
        if (batch.length < 100) break;
    }
    return out;
}

export async function getActivity(
    token: string,
    id: number,
    fetchFn: typeof fetch = fetch
): Promise<StravaActivity> {
    const res = await fetchFn(`${BASE}/api/v3/activities/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok)
        throw new Error(
            `Strava activity ${id} failed: ${res.status} ${await res.text()}`
        );
    return (await res.json()) as StravaActivity;
}
