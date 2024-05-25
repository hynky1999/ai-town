import { ObjectType, v } from 'convex/values';
import { Conversation, serializedConversation } from './conversation';
import { Player, serializedPlayer } from './player';
import { Agent, serializedAgent } from './agent';
import { GameId, parseGameId, playerId } from './ids';
import { parseMap } from '../util/object';
import { GameCycle, gameCycleSchema } from './gameCycle';
import { Votes, VotesSchema } from './voting';

export const historicalLocations = v.array(
  v.object({
    playerId,
    location: v.bytes(),
  }),
);

export const serializedWorld = {
  nextId: v.number(),
  conversations: v.array(v.object(serializedConversation)),
  players: v.array(v.object(serializedPlayer)),
  playersInit: v.array(v.object(serializedPlayer)),
  agents: v.array(v.object(serializedAgent)),
  historicalLocations: v.optional(historicalLocations),
  gameCycle: v.object(gameCycleSchema),
  gameVotes: v.array(v.object(VotesSchema)),
  llmVotes: v.array(v.object(VotesSchema)),
  winner: v.optional(v.union(v.literal('werewolves'), v.literal('villagers')))
};
export type SerializedWorld = ObjectType<typeof serializedWorld>;

export class World {
  nextId: number;
  conversations: Map<GameId<'conversations'>, Conversation>;
  players: Map<GameId<'players'>, Player>;
  playersInit: Map<GameId<'players'>, Player>; // kept for voting purpose
  agents: Map<GameId<'agents'>, Agent>;
  historicalLocations?: Map<GameId<'players'>, ArrayBuffer>;
  gameCycle: GameCycle;
  gameVotes: Votes[];
  llmVotes: Votes[];
  winner?: 'werewolves' | 'villagers' | undefined

  constructor(serialized: SerializedWorld) {
    const { nextId, historicalLocations } = serialized;

    this.nextId = nextId;
    this.conversations = parseMap(serialized.conversations, Conversation, (c) => c.id);
    this.players = parseMap(serialized.players, Player, (p) => p.id);
    this.playersInit = parseMap(serialized.playersInit, Player, (p) => p.id);
    this.agents = parseMap(serialized.agents, Agent, (a) => a.id);
    this.gameCycle = new GameCycle(serialized.gameCycle);
    this.gameVotes = serialized.gameVotes.map((v) => new Votes(v));
    this.llmVotes = serialized.llmVotes.map((v) => new Votes(v));
    this.winner = serialized.winner;
    
    if (historicalLocations) {
      this.historicalLocations = new Map();
      for (const { playerId, location } of historicalLocations) {
        this.historicalLocations.set(parseGameId('players', playerId), location);
      }
    }
  }

  playerConversation(player: Player): Conversation | undefined {
    return [...this.conversations.values()].find((c) => c.participants.has(player.id));
  }

  serialize(): SerializedWorld {
    return {
      nextId: this.nextId,
      conversations: [...this.conversations.values()].map((c) => c.serialize()),
      players: [...this.players.values()].map((p) => p.serialize()),
      playersInit: [...this.playersInit.values()].map((p) => p.serialize()),
      agents: [...this.agents.values()].map((a) => a.serialize()),
      historicalLocations:
        this.historicalLocations &&
        [...this.historicalLocations.entries()].map(([playerId, location]) => ({
          playerId,
          location,
        })),
      gameCycle: this.gameCycle.serialize(),
      gameVotes: this.gameVotes.map((v) => v.serialize()),
      llmVotes: this.llmVotes.map((v) => v.serialize()),
      winner: this.winner,
    };
  }
}
