import { ServerGame } from "@/hooks/serverGame";
import { Id } from "../../convex/_generated/dataModel";
import { GameId } from "../../convex/aiTown/ids";
import { canVote } from "./Game";
import { useSendInput } from "../hooks/sendInput";
import { VoteModal } from "./VoteModal";
import { useState } from "react";

const getSelectablePlayers = (game: ServerGame, playerId: GameId<'players'>, players: Player[]) => {
  if (game.world.gameCycle.cycleState === "WerewolfVoting") {
    return players.filter(
      (player) => (player.id !== playerId)
    );
  }

  else if (game.world.gameCycle.cycleState === "PlayerKillVoting") {
    return players.filter(
      (player) => (player.id !== playerId) && game.playerDescriptions.get(player.id)?.type === 'villager'
    );
  }
  return []
}


export default function GameVote({
  engineId,
  game,
  playerId,
}: {
  engineId: Id<'engines'>,
  game: ServerGame,
  playerId: GameId<'players'>,
  }) {
  const inputVote = useSendInput(engineId, "gameVote");
  const [votes, setVotes] = useState<GameId<'players'>[]>([]);
  const players = getSelectablePlayers(game, playerId, [...game.world.players.values()])
  return (
    <VoteModal 
      compact={true} 
      game={game} 
      engineId={engineId} 
      playerId={playerId} 
      maxVotes={1} 
      votes={votes} 
      players={players}
      onVote={(newVotes) => {
        setVotes(newVotes);
        inputVote({voter: playerId, votedPlayerIds: newVotes});
      }} 
    />
  );
}

