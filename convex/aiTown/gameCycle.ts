import { v, Infer, ObjectType } from 'convex/values';
import { Game } from './game';
import { 
  DAY_DURATION, 
  NIGHT_DURATION,
  WWOLF_VOTE_DURATION,
  PLAYER_KILL_VOTE_DURATION,
} from '../constants';
import { processVotes } from './voting';
import { parseLLMVotingResult } from './voting';
import { LLmvotingCallWerewolf } from './voting';
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
    const allVillagers = [...game.world.players.values()]
    const villagers = [...game.playerDescriptions.values()].filter(player => 
      player.type === 'villager'
    );
    // TODO: You should't vote for yourelf
    allVillagers.forEach((villager) => {
        LLmvotingCallWerewolf(villager, villagers).then(result => {
          parseLLMVotingResult(villager, result, game)
        })
      
    })
  };

  if(newState ==="PlayerKillVoting"){
    const werewolves = [...game.world.players.values()].filter((were) => {
      game.playerDescriptions.get(were.id)?.type === 'werewolf'
    })
    const villagers = [...game.playerDescriptions.values()]
    werewolves.forEach((were) => {
        LLmvotingCallWerewolf(were, villagers).then(result => {
          parseLLMVotingResult(were, result, game)
        })
      
    })
  };
  if (prevState === 'PlayerKillVoting') {
    const mostVotedPlayer = processVotes(game.world.gameVotes, [...game.world.players.values()])[0];
    const playerToKill = game.world.players.get(mostVotedPlayer.playerId);
    console.log(`killing: ${playerToKill?.id}, with ${game.world.gameVotes.length} votes`)
    if (playerToKill) {
      playerToKill.kill(game, now);
    }
    game.world.gameVotes = [];
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

  startNormal() {
    this.currentTime = 0;
    this.cycleState = 'Day';
    this.cycleIndex = 0;
    console.log('EndGame reached')
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
