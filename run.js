const { spawn } = require("child_process");
const path = require("path");

// Get port number from command line argument (default to 0)
const portNum = process.argv[2] || "0";
const frontendPort = 3000 + parseInt(portNum);
const backendPort = 8000 + parseInt(portNum);

console.log(`Starting application with ports:`);
console.log(`  Frontend: http://localhost:${frontendPort}`);
console.log(`  Backend:  http://localhost:${backendPort}`);

// Set environment variables
process.env.BACKEND_PORT = backendPort;
process.env.FRONTEND_PORT = frontendPort;
process.env.VITE_API_URL = `http://localhost:${backendPort}`;

// Start backend with nodemon
const backend = spawn("npx", ["nodemon", "--watch", "backend", "backend/server.js"], {
  env: { ...process.env },
  stdio: "inherit",
  shell: true,
});

// Start frontend with vite
const frontend = spawn("npx", ["vite", "--port", frontendPort, "--host"], {
  env: { ...process.env },
  stdio: "inherit",
  shell: true,
});

// Handle cleanup
process.on("SIGINT", () => {
  backend.kill();
  frontend.kill();
  process.exit();
});

backend.on("exit", (code) => {
  if (code !== 0) {
    console.error(`Backend exited with code ${code}`);
  }
  frontend.kill();
  process.exit(code);
});

frontend.on("exit", (code) => {
  if (code !== 0) {
    console.error(`Frontend exited with code ${code}`);
  }
  backend.kill();
  process.exit(code);
});
