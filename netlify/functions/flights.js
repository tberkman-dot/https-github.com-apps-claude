exports.handler = async (event) => {
    const { lat, lon, dist } = event.queryStringParameters || {};

    if (!lat || !lon || !dist) {
        return { statusCode: 400, body: 'Missing lat, lon, or dist parameters' };
    }

    try {
        const url = `https://api.adsb.lol/v2/lat/${lat}/lon/${lon}/dist/${dist}`;
        const res = await fetch(url);
        const data = await res.json();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(data),
        };
    } catch (err) {
        return { statusCode: 502, body: `Upstream error: ${err.message}` };
    }
};
