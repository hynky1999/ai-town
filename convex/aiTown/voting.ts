import { ObjectType, v } from "convex/values";
import { GameId, parseGameId, playerId } from "./ids";
import { Player } from "./player";
import { Game } from "./game";
import { HfInference } from "@huggingface/inference";
import { PlayerDescription } from "./playerDescription";

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
  const topKPlayers = sortedVoteCounts.slice(0, k).map((val) => {
    return {
      playerId: val[0] as GameId<'players'>,
      voteCount: val[1],
    };
  });
  return topKPlayers;
}
export function parseLLMVotingResult(voter: Player, log: any | null, game: Game) {
  let votedPlayerId = ''
  if (log?.arguments?.playerId) {
    console.log('Successfully voted to eliminate villager: ', log.arguments.playerId);
    votedPlayerId = log.arguments.playerId as string
  } else {
    const players = game.playerDescriptions.values();
    const playerIds = [...players].map(player => player.playerId);
    votedPlayerId = playerIds[Math.floor(Math.random() * playerIds.length)];
    console.log('Voted to eliminate villager: ', votedPlayerId);
  }
  gameVote(game, voter.id, [votedPlayerId as GameId<'players'>]);
}
export async function LLmvotingCallWerewolf(werewolf: Player, villagers: PlayerDescription[]) {
  // TODO: Use messages
  // TODO: till fixed
  const inference = new HfInference();
  const params = {
    model: "tgi",
    messages: [
      {
        role: "system",
        content: "You are a werewolf and shall eliminate someone based on a conversation. You shall eliminate villagers. Don't make assumptions about what values to plug into functions. You MUST call a tool",
      },
      { role: "user", content: `Who do you want to eliminate between the following player ? \n players : ${villagers} \n ` },
    ],
    max_tokens: 500,
    tool_choice: "auto",
    tools: [
      {
        type: "function",
        function: {
          name: "vote_player",
          description: "A function to chose on who to kick out",
          parameters: {
            type: "object",
            properties: {
              playerId: { type: "string", description: "The character playerId of the player to eliminate. ( eg : p:1, p:2, p:3 etc ...)" },
            },
            required: ["playerId"],
          },
        },
      },
    ],
  };
  // Streaming chat completion API
  const llama3 = inference.endpoint(
    "https://lr2bjyq40uegzvb5.us-east-1.aws.endpoints.huggingface.cloud"
  );

  const response = await llama3.chatCompletion(params);
  return response?.choices[0]?.message?.tool_calls?.[0]?.function || null;
}
export async function LLmvotingCallAll(villagers: PlayerDescription[]) {
  // TODO: till fixed
  const inference = new HfInference();
  const params = {
    model: "tgi",
    messages: [
      {
        role: "system",
        content: "You are a villager and shall try to eliminate someone based on a conversation. You shall eliminate werewolves. Don't make assumptions about what values to plug into functions. You MUST call a tool",
      },
      { role: "user", content: `Who do you want to eliminate between the following player ? \n players : ${villagers} \n ` },
    ],
    max_tokens: 500,
    tool_choice: "auto",
    tools: [
      {
        type: "function",
        function: {
          name: "vote_player",
          description: "A function to chose on who to kick out",
          parameters: {
            type: "object",
            properties: {
              playerId: { type: "string", description: "The character playerId of the player to eliminate. ( eg : p:1, p:2, p:3 etc ...)" },
            },
            required: ["playerId"],
          },
        },
      },
    ],
  };
  // Streaming chat completion API
  const llama3 = inference.endpoint(
    "https://lr2bjyq40uegzvb5.us-east-1.aws.endpoints.huggingface.cloud"
  );

  const response = await llama3.chatCompletion(params);
  return response?.choices[0]?.message?.tool_calls?.[0]?.function || null;

}

