import { v, Infer, ObjectType } from 'convex/values';
import { Game } from './game';
import { 
  DAY_DURATION, 
  NIGHT_DURATION,
  WWOLF_VOTE_DURATION,
  PLAYER_KILL_VOTE_DURATION,
  LLM_VOTE_DURATION,
} from '../constants';
import { LLMMessage, chatCompletion } from '../util/llm';
import { processVotes } from './voting';
import { HfInference } from "@huggingface/inference";
import { PlayerDescription } from './playerDescription';

export type CycleState = 'Day' | 'Night' | 'WerewolfVoting' | 'PlayerKillVoting' | 'EndGame' | 'LobbyState'

const stateDurations: { [key in CycleState]: number } = {
  Day: DAY_DURATION, 
  Night: NIGHT_DURATION,   
  WerewolfVoting: WWOLF_VOTE_DURATION,
  PlayerKillVoting: PLAYER_KILL_VOTE_DURATION, 
  EndGame: Infinity,     
  LobbyState: Infinity 
};

const normalCycle: CycleState[] = [
  'Day',
  'Night',
  'PlayerKillVoting',
  'WerewolfVoting',
];


export const gameCycleSchema = {
  currentTime: v.number(),
  cycleState: v.union( 
    v.literal('Day'),
    v.literal('Night'),
    v.literal('WerewolfVoting'),
    v.literal('PlayerKillVoting'),
    v.literal('EndGame'),
    v.literal('LobbyState'),
  ),
  cycleIndex: v.number(),
};

export type SerializedGameCycle = ObjectType<typeof gameCycleSchema>;

const onStateChange = (prevState: CycleState, newState: CycleState, game: Game, now: number) => {
  console.log(`state changed: ${ prevState } -> ${ newState }`);
  console.log("newState is :",newState)
  if(newState ==="WerewolfVoting"){
    console.log('players are : ', game.playerDescriptions);
    const werewolves = [...game.playerDescriptions.values()].filter(player => 
      player.type === 'werewolf'
    );
    const villagers = [...game.playerDescriptions.values()].filter(player => 
      player.type === 'villager'
    );
    console.log('Non-werewolf players: ', villagers);
    console.log('werewolf players: ', werewolves);
    // Call the function for each werewolf
   
  // Define a function to handle the asynchronous calls
  const handleAsyncCalls = async () => {
    // Call the async function for each werewolf
    for (const werewolf of werewolves) {
        const result = await LLmvotingCallWerewolf(werewolf, villagers);
        processFc(result,game)
    }
  };

  // Call the function to handle the asynchronous calls
  handleAsyncCalls();   
  }
  if(newState ==="PlayerKillVoting"){
    console.log('players are : ', game.playerDescriptions);
    const werewolves = [...game.playerDescriptions.values()].filter(player => 
      player.type === 'werewolf'
    );
    const villagers = [...game.playerDescriptions.values()]
  const handleAsyncCalls = async () => {
    // Call the async function for each werewolf
    for (const villager of villagers) {
       const result =  await LLmvotingCallAll(villagers);
       processFc(result,game)
    }
  };

  // Call the function to handle the asynchronous calls
  handleAsyncCalls(); 

  }
  if (prevState === 'PlayerKillVoting') {
    const werewolves = [...game.world.players.values()].filter(player => 
      player.playerType(game) === 'werewolf'
    )
    if (werewolves.length > 0) {
      // input votes from werewolf LLM
      const villagerDescription = [...game.playerDescriptions.values()].filter(player => 
        player.type === 'villager'
      );
      Promise.all(werewolves.map(wwolf => {
        if (!wwolf.human) {
          const wwolfDescription = game.playerDescriptions.get(wwolf.id);
          if (wwolfDescription) {
            return LLmvotingCallWerewolf(wwolfDescription, villagerDescription);

          }
        }
      })).then(results => {
        results.map(result => {
          if (result.arguments && result.arguments.playerId) {
            console.log(result);
            console.log('Successfully voted to eliminate villager: ', result.arguments.playerId);
          }
        })
      }
      )


      const mostVotedPlayer = processVotes(game.world.gameVotes, [...game.world.players.values()])[0];
      const playerToKill = game.world.players.get(mostVotedPlayer.playerId);
      console.log(`killing: ${playerToKill?.id}, with ${game.world.gameVotes.length} votes`)
      if (playerToKill) {
        playerToKill.kill(game, now);
      }
      game.world.gameVotes = [];
    } else {
      console.log('no werevolves in the game, nobody was killed')
    }
  }
  if (prevState === 'WerewolfVoting') {
    const mostVotedPlayer = processVotes(game.world.gameVotes, [...game.world.players.values()])[0];
    const suspect = game.world.players.get(mostVotedPlayer.playerId);
    console.log(`suspect: ${suspect?.id}, with ${game.world.gameVotes.length} votes`)
    if (suspect?.playerType(game) === 'werewolf') {
      suspect?.kill(game, now)
    }
    game.world.gameVotes = [];
  }
};
function processFc(log: any, game: Game) {
  try {
    if (log.arguments && log.arguments.playerId) {
      console.log('Successfully voted to eliminate villager: ', log.arguments.playerId);
    } else {
      const players = game.playerDescriptions.values();
      const playerIds = [...players].map(player => player.playerId); 
      const randomCharacter = playerIds[Math.floor(Math.random() * playerIds.length)];
      console.log('Voted to eliminate villager: ', randomCharacter);
    }
  } catch (error) {
    const players = game.playerDescriptions.values();
      const playerIds = [...players].map(player => player.playerId); 
      const randomCharacter = playerIds[Math.floor(Math.random() * playerIds.length)];
    console.log('Voted to eliminate villager: ', randomCharacter);
  }
}


export async function LLmvotingCallWerewolf(werewolf: PlayerDescription, villagers: PlayerDescription[]) {
  const inference = new HfInference("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");
  const params = {
    model: "tgi",
    messages: [
      {
        role: "system",
        content:
          "You are a werewolf and shall eliminate someone based on a conversation. You shall eliminate villagers. Don't make assumptions about what values to plug into functions. You MUST call a tool",
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
	"https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct/v1/chat/completions"
);

const response = await llama3.chatCompletion(params);
console.log(response.choices[0].message.tool_calls[0].function)

return response.choices[0].message.tool_calls[0].function
  
}
export async function LLmvotingCallAll(villagers: PlayerDescription[]) {
  const inference = new HfInference("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");
  const params = {
    model: "tgi",
    messages: [
      {
        role: "system",
        content:
          "You are a villager and shall try to eliminate someone based on a conversation. You shall eliminate werewolves. Don't make assumptions about what values to plug into functions. You MUST call a tool",
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
	"https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct/v1/chat/completions"
);

const response = await llama3.chatCompletion(params);
console.log(response.choices[0].message.tool_calls[0].function)
return response.choices[0].message.tool_calls[0].function.arguments
  
}

export class GameCycle {
  currentTime: number;
  cycleState: CycleState;
  cycleIndex: number;

  constructor(serialized: SerializedGameCycle) {
    const { currentTime, cycleState, cycleIndex } = serialized;
    this.currentTime = currentTime;
    this.cycleState = cycleState;
    this.cycleIndex = cycleIndex;
  }

  endgame() {
    this.currentTime = 0;
    this.cycleState = 'EndGame';
    this.cycleIndex = -1;
    console.log('EndGame reached')
  }

  // Tick method to increment the counter
  tick(game: Game, tickDuration: number) {
    this.currentTime += tickDuration;

    if (this.currentTime >= stateDurations[this.cycleState]) {
      const prevState = this.cycleState;
      this.currentTime = 0;
      this.cycleIndex = (this.cycleIndex + 1) % normalCycle.length;
      this.cycleState = normalCycle[this.cycleIndex];
      onStateChange(prevState, this.cycleState, game, tickDuration);
    }
  }


  serialize(): SerializedGameCycle {
    const { currentTime, cycleState, cycleIndex } = this;
    return {
      currentTime,
      cycleState,
      cycleIndex,
    };
  }
}
