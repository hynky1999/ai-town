import { v, Infer, ObjectType } from 'convex/values';
import { Game } from './game';
import { 
  DAY_DURATION, 
  NIGHT_DURATION,
  WWOLF_VOTE_DURATION,
  PLAYER_KILL_VOTE_DURATION,
  LLM_VOTE_DURATION,
} from '../constants';

type CycleState = 'Day' | 'Night' | 'WerewolfVoting' | 'PlayerKillVoting' | 'LLMsVoting' | 'LobbyState'

const stateDurations: { [key in CycleState]: number } = {
  Day: DAY_DURATION, 
  Night: NIGHT_DURATION,   
  WerewolfVoting: WWOLF_VOTE_DURATION,
  PlayerKillVoting: PLAYER_KILL_VOTE_DURATION, 
  LLMsVoting: LLM_VOTE_DURATION,     
  LobbyState: Infinity 
};

const normalCycle: CycleState[] = [
  'Day',
  'Night',
  'WerewolfVoting',
  'PlayerKillVoting',
];


export const gameCycleSchema = {
  currentTime: v.number(),
  cycleState: v.union( 
    v.literal('Day'),
    v.literal('Night'),
    v.literal('WerewolfVoting'),
    v.literal('PlayerKillVoting'),
    v.literal('LLMsVoting'),
    v.literal('LobbyState'),
  ),
  cycleIndex: v.number(),
};

export type SerializedGameCycle = ObjectType<typeof gameCycleSchema>;

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

  // Tick method to increment the counter
  tick(game: Game, tickDuration: number) {
    this.currentTime += tickDuration;

    if (this.currentTime >= stateDurations[this.cycleState]) {
      console.log(`changed state: ${ this.cycleState }`)
      this.currentTime = 0;
      this.cycleIndex = (this.cycleIndex + 1) % normalCycle.length;
      this.cycleState = normalCycle[this.cycleIndex];
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
