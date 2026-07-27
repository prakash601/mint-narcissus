export function terminalLog() {
  return {
    name: "terminal-log",
    apply: "serve",
    configureServer(server) {
      server.ws.on("terminal:log", (data) => {
        const { level, name, msg, ...rest } = data;
        const prefix = `[browser] [${name}]`;
        const method = level === "debug" ? "log" : level;
        const hasData = Object.keys(rest).length > 0;
        console[method](prefix, msg, hasData ? rest : "");
      });
    },
  };
}
