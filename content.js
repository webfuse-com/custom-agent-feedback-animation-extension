(() => {
    'use strict';

    // 1. Append the canvas at body
    const canvas = document.createElement('canvas');
    canvas.style.cssText =
        'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2147483647;display:none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let W = 0;
    let H = 0;
    const resize = () => {
        W = canvas.width = innerWidth;
        H = canvas.height = innerHeight;
    };
    resize();
    addEventListener('resize', resize);

    // 2. Animation
    const LAYERS = [
        { color: [66, 111, 255], depth: 32, alpha: 0.55, speed: 1.1 },
        { color: [120, 158, 255], depth: 18, alpha: 0.3, speed: 0.85 },
    ];

    const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

    const TRANSFORMS = [
        () => {},
        () => { ctx.translate(W, 0); ctx.rotate(Math.PI / 2); },
        () => { ctx.translate(W, H); ctx.rotate(Math.PI); },
        () => { ctx.translate(0, H); ctx.rotate(-Math.PI / 2); },
    ];

    function drawEdge(edge, depth, alpha, col, t, speed) {
        ctx.save();
        TRANSFORMS[edge]();
        const len = edge & 1 ? H : W;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let x = 0; x <= len; x += 14) {
            ctx.lineTo(x, depth + Math.sin(x * 0.012 + t * 5 * speed) * 8);
        }
        ctx.lineTo(len, 0);
        ctx.closePath();
        const gr = ctx.createLinearGradient(0, 0, 0, depth + 12);
        gr.addColorStop(0, rgba(col, alpha));
        gr.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = gr;
        ctx.fill();
        ctx.restore();
    }

    let lastEventAt = -Infinity;
    let rafId = 0;

    function draw(now) {
        const e = now - lastEventAt;
        const f = e <= 2000 ? 1 : e <= 3000 ? 1 - (e - 2000) / 1000 : 0;
        if (f <= 0) {
            rafId = 0;
            ctx.clearRect(0, 0, W, H);
            canvas.style.display = 'none';
            return;
        }
        rafId = requestAnimationFrame(draw);
        const t = now / 1000;
        ctx.clearRect(0, 0, W, H);
        for (const L of LAYERS) {
            for (let i = 0; i < 4; i++) drawEdge(i, L.depth, L.alpha * f, L.color, t, L.speed);
        }
    }

    function activate() {
        lastEventAt = performance.now();
        if (!rafId) {
            canvas.style.display = 'block';
            rafId = requestAnimationFrame(draw);
        }
    }

    // 3. Trigger on Automation API events
    browser.webfuseSession.automation.on('*', activate);

})(); 