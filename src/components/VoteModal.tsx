import { ServerGame } from "@/hooks/serverGame";
import { GameId } from "../../convex/aiTown/ids";
import Button from "./buttons/Button";
import { Id } from '../../convex/_generated/dataModel';
import { characters } from "../../data/characters";
import { useEffect, useState } from "react";
import { BaseTexture, SCALE_MODES, Spritesheet } from "pixi.js";
import { Stage } from "@pixi/react";
import { Character } from "./Character";
import { useSendInput } from "../hooks/sendInput";
import { GameCycle } from "../../convex/aiTown/gameCycle";
export type Vote = (id: GameId<'players'>) => void;

export function VotingName(gameCycle: GameCycle) {
  switch (gameCycle.cycleState) {
    case "WerewolfVoting":
      return {
        name: 'Warewolf Vote',
        desc: 'Select a player who is warewolf',
        type: 'WarewolfVote',
      };
    case "PlayerKillVoting":
      return {
        name: 'Player Kill',
        desc: 'Select a player to kill',
        type: 'PlayerKill',
      };
    default:
      return {
        name: 'Error',
        desc: 'Select a player to vote',
        type: 'Error'
      };
  }
}

export const VoteModal = ({
  worldId,
  engineId,
  game,
  humanPlayerId
}: {
  worldId: Id<'worlds'>,
  engineId: Id<'engines'>,
  game: ServerGame,
  humanPlayerId: GameId<'players'> | undefined

}) => {
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const vote = useSendInput(engineId, 'vote');
  const onVote = (playerId: GameId<'players'>) => {
    if (hasVoted) return;
    vote({votedPlayerId: playerId, voteType: gameState});
    setHasVoted(true);
  }
  const gameState = "warewolf-vote"


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
    (player) => (player.id !== humanPlayerId && (VotingName(game.world.gameCycle).type === 'WerewolfVoting' || game.playerDescriptions.get(player.id)?.type === 'werewolf'))
  );
  return (
    <>
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

