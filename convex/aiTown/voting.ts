import { ObjectType, v } from "convex/values";
import { GameId, parseGameId, playerId } from "./ids";
import { Player } from "./player";

export type VoteType = 'WarewolfVote' | 'PlayerKill' | 'LLMVote'

export const VotesSchema = {
  votesType: v.string(),
  votes: v.array(v.object({
    playerId: playerId,
    voter: playerId,
  }))
}

export type SerializedVotes = ObjectType<typeof VotesSchema>;
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

export const processVotes = (votes: Votes, players: Player[], k: number = 1) => {
  // Select the players with the most votes
  const voteCounts: Record<GameId<'players'>, number> = {};
  players.forEach(player => {
    voteCounts[player.id] = 0;
  });

  // Tally the votes
  votes.votes.forEach(vote => {
    voteCounts[vote.playerId] = (voteCounts[vote.playerId] || 0) + 1;
  });

  const sortedVoteCounts = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
  const topKPlayers = sortedVoteCounts.slice(0, k).map(entry => entry[0]);
  return topKPlayers;
  }

