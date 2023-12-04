const channel = new BroadcastChannel('locations');
const windowId = crypto.randomUUID();

let windowsData = {
    [windowId]: {
        screenX: window.screenX,
        screenY: window.screenY,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        windowId: windowId
    }
};

function broadcastLoc() {
    windowsData[windowId] = {
        screenX: window.screenX,
        screenY: window.screenY,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        windowId: windowId
    };
    channel.postMessage(windowsData[windowId]);
}

channel.onmessage = (event) => {
    const data = event.data;
    windowsData[data.windowId] = data;
    drawLines(windowsData, windowId);
};

setInterval(broadcastLoc, 10);



function drawLines(windowsData, currentWindowId) {
    const lineEndPoints = calculateLinePositions(currentWindowId, windowsData);
    const canvas = document.getElementById('lineCanvas');
    if (!canvas) {
        return;
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    lineEndPoints.forEach(point => {
        ctx.beginPath();
        ctx.moveTo(window.innerWidth / 2, window.innerHeight / 2);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    });
}

function calculateLinePositions(currentWindowId, windowsData) {
    const currentWindowData = windowsData[currentWindowId];
    if (!currentWindowData) {
        return [];
    }

    const centerX = currentWindowData.innerWidth / 2;
    const centerY = currentWindowData.innerHeight / 2;
    let lineEndPoints = [];

    for (const [uuid, data] of Object.entries(windowsData)) {
        if (uuid !== currentWindowId) {
            const relativeX = data.screenX - currentWindowData.screenX;
            const relativeY = data.screenY - currentWindowData.screenY;
            const directionX = relativeX > 0 ? 1 : -1;
            const directionY = relativeY > 0 ? 1 : -1;
            let endX, endY;

            if (Math.abs(relativeX) > Math.abs(relativeY)) {
                endX = directionX > 0 ? currentWindowData.innerWidth : 0;
                endY = centerY + (endX - centerX) * (relativeY / relativeX);
            } else {
                endY = directionY > 0 ? currentWindowData.innerHeight : 0;
                endX = centerX + (endY - centerY) * (relativeX / relativeY);
            }

            lineEndPoints.push({ x: endX, y: endY });
        }
    }

    return lineEndPoints;
}

window.onbeforeunload = () => {
    channel.close();
    delete windowsData[windowId];
};
