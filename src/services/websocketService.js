import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = {};
    this.messageHandlers = [];
  }

  connect(userId) {
    if (this.connected) {
      console.log('WebSocket already connected');
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      
      // REMOVE connectHeaders temporarily to test
      // connectHeaders: {
      //   Authorization: `Bearer ${localStorage.getItem('token')}`,
      // },

      debug: (str) => {
        console.log('STOMP:', str);
      },

      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('✅ WebSocket Connected Successfully!');
        this.connected = true;
        this.subscribeToTopics(userId);
      },

      onDisconnect: () => {
        console.log('❌ WebSocket Disconnected');
        this.connected = false;
      },

      onStompError: (frame) => {
        console.error('❌ STOMP Error:', frame.headers.message);
      },
    });

    this.client.activate();
  }

  subscribeToTopics(userId) {
    console.log('📡 Subscribing to topics for user:', userId);
    
    this.subscriptions.notifications = this.client.subscribe(
      `/user/${userId}/notifications`,
      (message) => {
        const notification = JSON.parse(message.body);
        console.log('📬 New Notification:', notification);
        this.handleMessage('notification', notification);
      }
    );

    this.subscriptions.bookings = this.client.subscribe(
      `/user/${userId}/bookings`,
      (message) => {
        const booking = JSON.parse(message.body);
        console.log('📅 Booking Update:', booking);
        this.handleMessage('booking', booking);
      }
    );

    console.log('✅ Subscribed to all topics');
  }

  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  handleMessage(type, data) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(type, data);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  send(destination, body) {
    if (!this.connected) {
      console.error('Cannot send: Not connected');
      return;
    }
    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  disconnect() {
    if (this.client) {
      Object.values(this.subscriptions).forEach(sub => sub.unsubscribe());
      this.subscriptions = {};
      this.client.deactivate();
      this.connected = false;
    }
  }

  isConnected() {
    return this.connected;
  }
}

const websocketService = new WebSocketService();
export default websocketService;