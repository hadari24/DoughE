const db = require('../../models');

function initSocket(io) {
  let onlineCount = 0;

  io.on('connection', (socket) => {
    onlineCount++;
    io.emit('presence:update', { online: onlineCount });

    socket.on('recipe:join', ({ recipeId }) => {
      socket.join(`recipe:${recipeId}`);
      // send the current online count to this client right away
      socket.emit('presence:update', { online: onlineCount });
    });

    socket.on('comment:new', async (payload) => {
      const uid = parseInt(payload.userId);
      const userId = isNaN(uid) ? null : uid;
      const r = parseInt(payload.rating);
      const rating = r >= 1 && r <= 5 ? r : null;
      let saved = {
        recipeId: payload.recipeId,
        userId,
        userName: payload.userName || 'Guest',
        text: payload.text,
        rating,
        createdAt: new Date().toISOString(),
      };
      try {
        const c = await db.Comment.create({
          recipeId: payload.recipeId,
          userId,
          text: payload.text,
          rating,
        });
        saved.commentId = c.commentId;
        saved.createdAt = c.createdAt;
      } catch (e) {
        console.error('Failed to save comment:', e.message);
      }
      io.to(`recipe:${payload.recipeId}`).emit('comment:added', saved);
    });

    socket.on('typing', ({ recipeId, userName }) => {
      socket.to(`recipe:${recipeId}`).emit('typing', { userName });
    });

    socket.on('disconnect', () => {
      onlineCount = Math.max(0, onlineCount - 1);
      io.emit('presence:update', { online: onlineCount });
    });
  });
}

module.exports = { initSocket };
