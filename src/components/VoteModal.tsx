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
import { PlayerDescription } from "../../convex/aiTown/playerDescription";
export type Vote = (id: GameId<'players'>[]) => void;

const getSelectablePlayers = (game: ServerGame, playerId: GameId<'players'>) => {
  if (game.world.gameCycle.cycleState === "WerewolfVoting") {
    return [...game.world.players.values()].filter(
      (player) => (player.id !== playerId)
    );
  }

  else if (game.world.gameCycle.cycleState === "PlayerKillVoting") {
    return [...game.world.players.values()].filter(
      (player) => (player.id !== playerId) && game.playerDescriptions.get(player.id)?.type === 'villager'
    );
  }
  return []
}

export const VoteModal = ({
  engineId,
  game,
  playerId,
  maxVotes=1,
  votes,
  onVote,
  compact
}: {
  engineId: Id<'engines'>,
  game: ServerGame,
  playerId: GameId<'players'>,
  maxVotes: number,
  votes: GameId<'players'>[],
  onVote: (votes: GameId<'players'>[]) => void,
  compact: boolean
}) => {
  const vote = (playerId: GameId<'players'>) => {
    let newVotes = votes;
    if (votes.includes(playerId)) {
      newVotes = newVotes.filter((vote) => vote !== playerId);
    } else {
      newVotes = [...votes, playerId];
    }
    if (newVotes.length > maxVotes) {
      // Removed the first vote and add the new vote
      newVotes = newVotes.slice(1);
    }
    console.log(`votes: ${newVotes.map((vote) => game.playerDescriptions.get(vote)?.name).join(", ")}`)
    onVote(newVotes);
  }
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
  const selectablePlayers = getSelectablePlayers(game, playerId);
  return (
    <div className={`flex gap-4 ${compact ? "flex-col" : "flex-wrap justify-center"}`}>
      {selectablePlayers.map((playable) => {
        const playerDesc = game.playerDescriptions.get(playable.id);
        const character = characters.find((c) => c.name === playerDesc?.character);
        if (!character) return null;
        const selected = votes.includes(playable.id);
        return (
          <>
            <Button onClick={() => vote(playable.id)}
            className="lg:block border-2 border-gold min-w-[100px]"
            title={playerDesc?.name}
            selected={selected}
            key={playable.id}
            disabled={selected}
            >
              {playerDesc?.name}
              <Stage width={30} height={40} options={{backgroundAlpha: 0.0}}>
                {
                  spriteSheet && <Character textureUrl={character.textureUrl} isViewer={true} spritesheetData={character.spritesheetData} x={15} y={15} orientation={0} onClick={() => {} } />
                }
              </Stage>
            </Button>
          </>
        )
      })}
    </div>
  )
  


}

