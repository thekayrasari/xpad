const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
    ws.send(JSON.stringify({
        topic: 'vpilot_message_received',
        payload: {
            sender: 'TEST_ATC',
            content: 'This is a test message on the active frequency.',
            isPrivate: false,
            isSentByMe: false,
            tab: 'ATC',
            frequency: '122.800'
        }
    }));
    
    ws.send(JSON.stringify({
        topic: 'vpilot_message_received',
        payload: {
            sender: 'TEST_ATIS',
            content: 'This is a test ATIS.',
            isPrivate: false,
            isSentByMe: false,
            tab: 'ATC'
        }
    }));

    setTimeout(() => {
        ws.close();
        process.exit(0);
    }, 1000);
});
