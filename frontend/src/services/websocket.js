const WS_BASE_URL = import.meta.env.VITE_WS_URL || `ws://${window.location.host}/api/ws`;

export class DashboardWebSocket {
  constructor(onMessage) {
    this.onMessage = onMessage;
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    this.socket = new WebSocket(`${WS_BASE_URL}/dashboard`);

    this.socket.onopen = () => {
      console.log('Dashboard WebSocket Connected');
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onMessage(data);
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    };

    this.socket.onclose = () => {
      console.log('Dashboard WebSocket Disconnected');
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
      }
    };

    this.socket.onerror = (error) => {
      console.error('Dashboard WebSocket Error:', error);
      this.socket.close();
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }

  send(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }
}
