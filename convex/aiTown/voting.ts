import { ObjectType, v } from "convex/values";
import { GameId, parseGameId, playerId } from "./ids";
import { Player } from "./player";
import { Game } from "./game";

export const VotesSchema = {
  voter: playerId,
  playerIds: v.array(playerId),
}

export type SerializedVotes = ObjectType<typeof VotesSchema>;
export class Votes {
  voter: GameId<'players'>;
  playerIds: GameId<'players'>[];

  constructor(serialized: SerializedVotes) {
    const { voter, playerIds } = serialized;
    this.voter = parseGameId('players', voter);
    this.playerIds = playerIds.map((playerId) => parseGameId('players', playerId));
  }

  serialize(): SerializedVotes {
    const { voter, playerIds } = this;
    return {
      voter,
      playerIds,
    };
  }
}

export const llmVote = (game: Game, voter: GameId<'players'>, playerIds: GameId<'players'>[]) => {
  // If the voter has already voted, remove their vote
  let new_votes = game.world.llmVotes.filter((vote) => vote.voter !== voter);
  new_votes.push(new Votes({
    voter,
    playerIds,
  }));
  game.world.llmVotes = new_votes
}

export const gameVote = (game: Game, voter: GameId<'players'>, playerIds: GameId<'players'>[]) => {
  // If the voter has already voted, remove their vote
  let new_votes = game.world.gameVotes.filter((vote) => vote.voter !== voter);
  new_votes.push(new Votes({
    voter,
    playerIds,
  }));
  game.world.gameVotes = new_votes
}

export const processVotes = (votes: Votes[], players: Player[], k: number = 1) => {
  // Select the players with the most votes
  const voteCounts: Record<GameId<'players'>, number> = {};
  players.forEach(player => {
    voteCounts[player.id] = 0;
  });

  // Tally the votes
  votes.forEach(vote => {
    vote.playerIds.forEach(playerId => {
      voteCounts[playerId] = (voteCounts[playerId] || 0) + 1;
    });
  });

  // This can mean that warevolves can each other but whatever
  const sortedVoteCounts = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
  const topKPlayers = sortedVoteCounts.slice(0, k).map(entry => entry[0]);
  return topKPlayers as GameId<'players'>[];
  }

