import { ObjectType, v } from 'convex/values';
import { GameId, parseGameId, playerId } from './ids';

export type CharacterType = 'villager' | 'werewolf';
export const CharacterTypeSchema = v.union(v.literal('villager'), v.literal('werewolf'));

export const serializedPlayerDescription = {
  playerId,
  name: v.string(),
  description: v.string(),
  character: v.string(),
  type: CharacterTypeSchema,
};
export type SerializedPlayerDescription = ObjectType<typeof serializedPlayerDescription>;

export class PlayerDescription {
  playerId: GameId<'players'>;
  name: string;
  description: string;
  character: string;
  type: CharacterType;

  constructor(serialized: SerializedPlayerDescription) {
    const { playerId, name, description, character, type } = serialized;
    this.playerId = parseGameId('players', playerId);
    this.name = name;
    this.description = description;
    this.character = character;
    this.type = type;
  }

  serialize(): SerializedPlayerDescription {
    const { playerId, name, description, character, type } = this;
    return {
      playerId,
      name,
      description,
      type: type,
      character,
    };
  }
}
