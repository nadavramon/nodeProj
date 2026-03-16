import config from "../../../config.js";

const levels = {
  info: 0,
  warn: 1,
  error: 2,
};

const currentLevel = levels[config.logLevel?.toLowerCase()] ?? 0;

const getTimestamp = () => new Date().toISOString().replace("T", " ").split(".")[0];

const formatMessage = (level, component, message, metadata = {}) => {
  const metaString = Object.keys(metadata).length ? ` ${JSON.stringify(metadata)}` : "";
  return `[${getTimestamp()}] [${level.toUpperCase()}] [${component.toUpperCase()}] ${message}${metaString}`;
};

export const info = (component, message, metadata) => {
  if (currentLevel <= levels.info) {
    console.log(formatMessage("info", component, message, metadata));
  }
};

export const warn = (component, message, metadata) => {
  if (currentLevel <= levels.warn) {
    console.warn(formatMessage("warn", component, message, metadata));
  }
};

export const error = (component, message, metadata) => {
  if (currentLevel <= levels.error) {
    console.error(formatMessage("error", component, message, metadata));
  }
};
