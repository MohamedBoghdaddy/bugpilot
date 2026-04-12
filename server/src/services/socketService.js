function getIO(app) {
  if (!app || typeof app.get !== "function") return null;
  return app.get("io");
}

function emit(app, event, payload) {
  const io = getIO(app);
  if (io) {
    io.emit(event, payload);
  }
}

const EVENTS = {
  BUG_CREATED: "bugCreated",
  BUG_UPDATED: "bugUpdated",
  BUG_DELETED: "bugDeleted",
  COMMENT_ADDED: "commentAdded",
};

module.exports = {
  getIO,
  emit,
  EVENTS,
};
