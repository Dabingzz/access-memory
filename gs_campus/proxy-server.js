// 简单的CORS代理服务器
// 使用方法: node proxy-server.js
// 然后在浏览器中使用 http://localhost:3001/proxy?url=目标URL

import http from 'http';
import https from 'https';
import url from 'url';

const PORT = 3001;

const server = http.createServer((req, res) => {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url.startsWith('/proxy')) {
        const parsedUrl = url.parse(req.url, true);
        const targetUrl = parsedUrl.query.url;

        if (!targetUrl) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('缺少url参数');
            return;
        }

        // 移除X-Frame-Options等可能阻止iframe的头部
        const targetUrlParsed = url.parse(targetUrl);
        const options = {
            hostname: targetUrlParsed.hostname,
            port: targetUrlParsed.port || (targetUrlParsed.protocol === 'https:' ? 443 : 80),
            path: targetUrlParsed.path,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        };

        const protocol = targetUrlParsed.protocol === 'https:' ? https : http;

        const proxyReq = protocol.request(options, (proxyRes) => {
            // 移除可能阻止iframe的响应头
            const headers = { ...proxyRes.headers };
            delete headers['x-frame-options'];
            delete headers['content-security-policy'];
            delete headers['x-content-type-options'];
            
            // 设置CORS头
            headers['access-control-allow-origin'] = '*';
            headers['access-control-allow-methods'] = 'GET, POST, OPTIONS';
            headers['access-control-allow-headers'] = 'Content-Type';

            res.writeHead(proxyRes.statusCode, headers);
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (err) => {
            console.error('代理请求错误:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('代理请求失败: ' + err.message);
        });

        proxyReq.end();
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('未找到');
    }
});

server.listen(PORT, () => {
    console.log(`CORS代理服务器运行在 http://localhost:${PORT}`);
    console.log('使用方法: http://localhost:3001/proxy?url=目标URL');
});

