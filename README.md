# 🌀 MORPH — Collective Reality Website

A real-time, collaborative website that morphs based on voice commands. Everyone sees the same transformations happening live.

## 🎯 Features

- **Real-time Voice Control**: Speak your idea and watch the website transform
- **Shared Reality**: All visitors see the same morphed website simultaneously
- **AI-Powered Generation**: Uses Claude API to create websites on-the-fly
- **Content Moderation**: Automatically rejects NSFW/inappropriate requests
- **Live Activity Feed**: See what everyone is creating in real-time
- **Queue System**: One person calls at a time, others wait their turn
- **WebSocket Backend**: Instant updates for all connected users

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Anthropic API access (already configured in the code)

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Start the server**:
```bash
npm start
```

3. **Open in browser**:
```
http://localhost:8080/morph_frontend.html
```

4. **Open multiple tabs/windows** to see the real-time synchronization!

### Development Mode
```bash
npm run dev
```
Uses nodemon for auto-restart on file changes.

## 🎮 How It Works

### User Flow:
1. **Join**: Visit the website - you see the current morphed state
2. **Call**: Click the phone button to request control
3. **Speak**: Say your website idea (e.g., "make a todo list app")
4. **Watch**: See the website transform in real-time
5. **Everyone sees it**: All connected users see the same transformation

### Technical Architecture:

```
┌─────────────┐
│   Browser   │ ◄──► WebSocket ◄──► ┌──────────────┐
│  (Client)   │                      │   Node.js    │
└─────────────┘                      │    Server    │
                                     └──────────────┘
                                            │
                                            ▼
                                     ┌──────────────┐
                                     │  Claude API  │
                                     │  (Generates  │
                                     │   Websites)  │
                                     └──────────────┘
```

### Server State:
- **Current Morph**: The active website HTML that everyone sees
- **Activity History**: Last 100 transformations and rejections
- **Active Call**: Currently speaking user (queue system)
- **Connected Clients**: All WebSocket connections
- **Stats**: Viewer count, total morphs

## 📡 WebSocket Messages

### Client → Server:
- `join`: Register new client
- `request_call`: Request permission to speak
- `morph_request`: Submit idea for transformation
- `end_call`: Release call permission

### Server → Client:
- `stats`: Viewer count and morph count
- `morph`: New website HTML to display
- `rejected`: Idea was blocked
- `call_started`: Someone started calling
- `call_ended`: Call finished
- `queue`: You're in queue
- `history`: Current state + activity log

## 🎨 Example Ideas to Try

Safe and fun:
- "a pomodoro timer"
- "random cat facts"
- "breathing meditation app"
- "color palette generator"
- "simple calculator"
- "random quote generator"
- "digital rain like the Matrix"
- "bouncing DVD logo"

## 🛡️ Content Moderation

The AI automatically rejects:
- NSFW content
- Violence or weapons
- Illegal activities
- Harmful instructions
- Malicious code

Rejected requests are logged in the activity feed but don't change the website.

## 🌐 Deployment

For production deployment:

1. **Update WebSocket URL** in `morph_frontend.html`:
```javascript
const WS_URL = 'wss://your-domain.com'; // Use wss:// for secure
```

2. **Environment Variables**:
```bash
PORT=8080 # or your preferred port
```

3. **Deploy to**:
- Heroku
- Railway
- DigitalOcean
- AWS EC2
- Any Node.js hosting

4. **Use a process manager**:
```bash
npm install -g pm2
pm2 start morph_server.js
```

## 🔧 Configuration

Edit `morph_server.js` to customize:
- Content moderation rules
- Max activity history length
- Claude API parameters
- Rate limiting (if needed)

## 📊 Scaling Considerations

For millions of users:
- Add Redis for shared state across multiple server instances
- Use a load balancer (nginx)
- Implement rate limiting per user
- Cache generated websites
- Add CDN for static assets
- Database for persistent history

## 🎯 Why This Will Go Viral

1. **Collective Experience**: Everyone shares the same reality
2. **Unpredictable**: Never know what appears next
3. **Social Proof**: Live viewer count creates FOMO
4. **Shareable**: "OMG someone turned it into X!"
5. **Participatory**: Anyone can change it
6. **Instant Gratification**: Real-time transformation
7. **No Registration**: Just click and speak

## 📝 License

MIT

## 🤝 Contributing

This is a demo project. Feel free to fork and enhance!

---

**Built with**: Node.js, WebSocket, Claude API, Web Speech API
