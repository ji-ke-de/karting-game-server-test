import { MatchmakingClient } from "./client";

async function test() {
  const clients: MatchmakingClient[] = [];

  // Create and join 10 clients
  for (let i = 0; i < 10; i++) {
    const client = new MatchmakingClient("ws://localhost:2567");
    await client.joinMatchmaking();
    clients.push(client);
    await new Promise(resolve => setTimeout(resolve, 100)); // wait a bit before creating the next client
  }

  // Leave all clients after 10 seconds
  setTimeout(() => {
    clients.forEach(client => client.leaveMatchmaking());
  }, 10000);
}

test();
