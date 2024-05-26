import { ServerGame } from "@/hooks/serverGame";
import { GameId } from "../../convex/aiTown/ids";
import Button from "./buttons/Button";
import { Id } from '../../convex/_generated/dataModel';
import { characters } from "../../data/characters";
import { Stage } from "@pixi/react";
import { Character } from "./Character";
import { Player } from "../../convex/aiTown/player";
export type Vote = (id: GameId<'players'>[]) => void;
export const VoteModal = ({
  engineId,
  game,
  playerId,
  maxVotes=1,
  players,
  votes,
  onVote,
  compact
}: {
  engineId: Id<'engines'>,
  game: ServerGame,
  playerId: GameId<'players'>,
  maxVotes: number,
  players: Player[],
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
  return (
    <div className={`flex gap-4 ${compact ? "flex-col" : "flex-wrap justify-center"}`}>
      {players.map((playable) => {
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
                  <Character textureUrl={character.textureUrl} isViewer={true} spritesheetData={character.spritesheetData} x={15} y={15} orientation={0} onClick={() => {} } />
                }
              </Stage>
            </Button>
          </>
        )
      })}
    </div>
  )
  


}

