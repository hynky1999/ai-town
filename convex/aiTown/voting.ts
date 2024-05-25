import { ObjectType, v } from "convex/values";
import { GameId, parseGameId, playerId } from "./ids";

export const serializedVotes = {
  votesType: v.string(),
  votes: v.array(v.object({
    playerId: playerId,
    voter: playerId,
  }))
}

export type SerializedVotes = ObjectType<typeof serializedVotes>;
export class Votes {
  votesType: string;
  votes: {
    playerId: GameId<'players'>;
    voter: GameId<'players'>;
  }[];

  constructor(serialized: SerializedVotes) {
    const { votesType, votes } = serialized;

    this.votesType = votesType;
    this.votes = votes.map((vote) => ({
      playerId: parseGameId('players', vote.playerId),
      voter: parseGameId('players', vote.voter),
    }));
  }

  serialize(): SerializedVotes {
    const { votesType, votes } = this;
    return {
      votesType,
      votes,
    };
  }
}