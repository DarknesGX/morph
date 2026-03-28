// MORPH Backend Server
// Install dependencies: npm install ws express

const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static('.'));

// State
let clients = new Set();
let currentMorph = null;
let activityHistory = [];
let totalMorphs = 0;
let activeCall = null; // userId of person currently calling

// Broadcast to all clients
function broadcast(data) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Send stats update
function broadcastStats() {
    broadcast({
        type: 'stats',
        viewers: clients.size,
        totalMorphs: totalMorphs
    });
}

// WebSocket connection handler
wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('New client connected. Total:', clients.size);
    
    // Send current state to new client
    ws.send(JSON.stringify({
        type: 'history',
        currentMorph: currentMorph,
        activities: activityHistory.slice(-20)
    }));
    
    broadcastStats();

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            await handleClientMessage(ws, data);
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected. Total:', clients.size);
        
        // If the active caller disconnects, release the call
        if (ws.userId === activeCall) {
            activeCall = null;
            broadcast({ type: 'call_ended' });
        }
        
        broadcastStats();
    });
});

async function handleClientMessage(ws, data) {
    switch (data.type) {
        case 'join':
            ws.userId = data.userId;
            break;

        case 'request_call':
            // Check if someone else is already calling
            if (activeCall && activeCall !== data.userId) {
                ws.send(JSON.stringify({
                    type: 'queue',
                    message: 'Someone else is calling'
                }));
                return;
            }
            
            activeCall = data.userId;
            broadcast({
                type: 'call_started',
                userId: data.userId
            });
            break;

        case 'end_call':
            if (activeCall === data.userId) {
                activeCall = null;
                broadcast({ type: 'call_ended' });
            }
            break;

        case 'morph_request':
            if (activeCall !== data.userId) {
                return; // Ignore if not the active caller
            }

            const idea = data.idea;
            const username = `User${data.userId.substring(0, 4)}`;
            
            console.log(`Processing morph request: "${idea}" from ${username}`);
            
            // Call Claude API to generate website
            const result = await generateMorph(idea);
            
            if (result.rejected) {
                // Broadcast rejection
                const activity = {
                    user: username,
                    text: `"${idea}" — REJECTED: ${result.reason}`,
                    rejected: true,
                    timestamp: Date.now()
                };
                
                activityHistory.push(activity);
                
                broadcast({
                    type: 'rejected',
                    user: username,
                    idea: idea,
                    reason: result.reason
                });
            } else {
                // Update current morph
                currentMorph = {
                    html: result.html,
                    idea: idea,
                    user: username,
                    timestamp: Date.now()
                };
                
                totalMorphs++;
                
                const activity = {
                    user: username,
                    text: idea,
                    rejected: false,
                    timestamp: Date.now()
                };
                
                activityHistory.push(activity);
                
                // Broadcast the morph to everyone
                broadcast({
                    type: 'morph',
                    html: result.html,
                    idea: idea,
                    user: username
                });
                
                broadcastStats();
            }
            
            // Release the call
            activeCall = null;
            broadcast({ type: 'call_ended' });
            
            // Keep history manageable
            if (activityHistory.length > 100) {
                activityHistory = activityHistory.slice(-100);
            }
            break;
    }
}

async function generateMorph(idea) {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 4000,
                messages: [{
                    role: 'user',
                    content: `You are a website generator. The user said: "${idea}"
                    
First, check if this idea contains any NSFW, inappropriate, harmful, violence, weapons, illegal activities, or malicious content. If it does, respond with EXACTLY:
REJECTED: [brief 3-5 word reason]

If the idea is safe and appropriate, create a fully functional, creative, and polished HTML page (with inline CSS and JavaScript) that implements their idea. Make it:
- Visually appealing with modern, bold design
- Fully functional with working features
- Self-contained (all code in one HTML block)
- Creative and engaging
- Mobile-responsive
- Use vibrant colors and smooth animations

Return ONLY the HTML code, no markdown backticks, no explanation. Just raw HTML starting with <!DOCTYPE html>.

IMPORTANT: Make it visually distinct and creative. Avoid generic designs. Use interesting color schemes, unique layouts, and engaging interactions.`
                }]
            })
        });

        const data = await response.json();
        const result = data.content[0].text;

        // Check if rejected
        if (result.startsWith('REJECTED:')) {
            const reason = result.replace('REJECTED:', '').trim();
            return { rejected: true, reason };
        }

        return { rejected: false, html: result };
        
    } catch (error) {
        console.error('Error generating morph:', error);
        return { 
            rejected: true, 
            reason: 'Server error' 
        };
    }
}

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`🌀 MORPH server running on port ${PORT}`);
    console.log(`   Frontend: http://localhost:${PORT}/morph_frontend.html`);
});
