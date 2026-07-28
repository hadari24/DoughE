import { io } from 'socket.io-client';

// Same backend origin as the REST API (set REACT_APP_API_URL on Render in production).
const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const socket = io(SOCKET_URL, { autoConnect: true });

export default socket;
