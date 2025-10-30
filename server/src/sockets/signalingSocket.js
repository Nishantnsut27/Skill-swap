const emitToTarget = (io, targetId, event, payload) => {
  if (!targetId) return;
  io.to(targetId.toString()).emit(event, payload);
};

export default function registerSignalingSocket(io, socket) {
  const userId = socket.user._id.toString();

  socket.on('call:initiate', ({ targetId, fromName, fromId }) => {
    if (!targetId) return;
    emitToTarget(io, targetId, 'call:incoming', {
      from: userId,
      fromName: fromName || socket.user.name,
      fromId: fromId || userId,
    });
  });

  socket.on('call:accept', ({ targetId }) => {
    if (!targetId) return;
    emitToTarget(io, targetId, 'call:accepted', {
      from: userId,
      targetId: userId,
    });
  });

  socket.on('call:reject', ({ targetId }) => {
    if (!targetId) return;
    emitToTarget(io, targetId, 'call:rejected', {
      from: userId,
    });
  });

  socket.on('call:init', ({ targetId }) => {
    if (!targetId) return;
    emitToTarget(io, targetId, 'call:init', {
      from: userId,
      fromName: socket.user.name,
    });
  });

  socket.on('call:offer', ({ targetId, description }) => {
    if (!targetId || !description) return;
    emitToTarget(io, targetId, 'call:offer', {
      from: userId,
      fromName: socket.user.name,
      description,
    });
  });

  socket.on('call:answer', ({ targetId, description }) => {
    if (!targetId || !description) return;
    emitToTarget(io, targetId, 'call:answer', {
      from: userId,
      description,
    });
  });

  socket.on('call:ice', ({ targetId, candidate }) => {
    if (!targetId || !candidate) return;
    emitToTarget(io, targetId, 'call:ice', {
      from: userId,
      candidate,
    });
  });

  socket.on('call:end', ({ targetId }) => {
    if (!targetId) return;
    emitToTarget(io, targetId, 'call:end', {
      from: userId,
    });
  });
}
