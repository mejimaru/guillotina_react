import React from "react";
import { Config } from "../models/config";

let calculated = Object.assign({}, Config);

const addConfig = (additional, original) => {
  const rest = Object.assign({}, original);
  Object.keys(additional).forEach(item => {
    if (typeof Config[item] === "object" && Array.isArray(Config[item])) {
      rest[item] = [].concat(Config[item], additional[item]);
    } else if (typeof Config[item] === "object") {
      rest[item] = Object.assign({}, Config[item], additional[item]);
    } else {
      rest[item] = additional[item];
    }
  });
  return rest;
};

export function useConfig(cfg) {
  const ref = React.useRef(null);

  if (!ref.current) {
    ref.current = calculated;
  }

  if (cfg) {
    ref.current = addConfig(cfg, ref.current);
  }

  return ref.current;
}
