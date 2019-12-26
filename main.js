const http = require("http");

const serverPairs = {};

const requestHandler = (req, res) => {
    if (req.url.startsWith("/track")) {
        if (req.method !== "POST") {
            res.statusCode = 400;
            res.end();
            return;
        }

        let body = "";
        req.on("data", data => {
            body += data;
            if (body.length > 64) req.connection.destroy();
        });
        req.on("end", () => {
            serverPairs[body.trim()] = {
                ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
                ts: (new Date(Date.now())).toISOString()
            };

            res.statusCode = 204;
            res.end();
        })
    } else if (req.url.startsWith("/status")) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(serverPairs, null, 2));
    }
};

const port = process.env.PORT || 3030;

const server = http.createServer(requestHandler);
server.listen(port, err => {
    if (err) return console.error(err);
    console.log(`Listening on ${port}`)
});
