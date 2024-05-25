import { ServerGame } from "@/hooks/serverGame";
import { SelectElement } from "./Player";
import { GameId } from "../../convex/aiTown/ids";
import Button from "./buttons/Button";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from '../../convex/_generated/dataModel';
import { characters } from "../../data/characters";
import { useEffect, useState } from "react";
import { BaseTexture, SCALE_MODES, Spritesheet } from "pixi.js";
import { Sprite, Stage } from "@pixi/react";
import { Character } from "./Character";
import { useSendInput } from "../hooks/sendInput";
export type Vote = (id: GameId<'players'>) => void;

export function VotingName(gameState: string) {
  switch (gameState) {
    case 'warewolf-vote':
      return {
        name: 'Warewolf Vote',
        desc: 'Select a player who is warewolf',
        type: 'warewolf-vote',
      };
    case 'player-kill':
      return {
        name: 'Player Kill',
        desc: 'Select a player to kill',
        type: 'player-kill',
      };
    default:
      return {
        name: 'Voting',
        desc: 'Select a player to vote',
        type: 'voting',
      };
  }
}

export const VoteModal = ({
  worldId,
  engineId,
  game,
}: {
  worldId: Id<'worlds'>,
  engineId: Id<'engines'>,
  game: ServerGame,

}) => {
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const vote = useSendInput(engineId, 'vote');
  const onVote = (playerId: GameId<'players'>) => {
    if (hasVoted) return;
    vote({votedPlayerId: playerId, voteType: gameState});
    setHasVoted(true);
  }
  const gameState = "warewolf-vote"


  const humanTokenIdentifier = useQuery(api.world.userStatus, {worldId});
  const [spriteSheet, setSpriteSheet] = useState<Spritesheet>();
  const character = characters[0]
  useEffect(() => {
    const parseSheet = async () => {
      const sheet = new Spritesheet(
        BaseTexture.from(character.textureUrl, {
          scaleMode: SCALE_MODES.NEAREST,
        }),
        character.spritesheetData,
      );
      await sheet.parse();
      setSpriteSheet(sheet);
    };
    void parseSheet();
  }, []);
  // TODO only let people select non-dead players
  const selectablePlayers = [...game.world.players.values()].filter(
    (player) => player.id !== humanTokenIdentifier
  );
  return (
    <>
      <div className="flex flex-col items-center mb-4">
        <h2 className="text-2xl font-bold">{VotingName(gameState).name}</h2>
        <p className="text-lg">{VotingName(gameState).desc}</p>
      </div>
      {selectablePlayers.map((playable) => {
        const playerDesc = game.playerDescriptions.get(playable.id);
        const character = characters.find((c) => c.name === playerDesc?.character);
        if (!character) return null;
        return (
          <>
            <Button onClick={() => onVote(playable.id)}
            className="lg:block border-2 border-gold"
            title={character?.name}
            key={playable.id}
            >
              {character?.name}
              <Stage width={30} height={40} options={{backgroundAlpha: 0.0}}>
                {
                  spriteSheet && <Character textureUrl={character.textureUrl} isViewer={true} spritesheetData={character.spritesheetData} x={15} y={15} orientation={0} onClick={() => {} } />
                }
              </Stage>
            </Button>
          </>
        )
      })}
    </>
  )
  


}

