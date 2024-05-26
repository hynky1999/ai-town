import { ServerGame } from "@/hooks/serverGame";
import { Id } from "../../convex/_generated/dataModel";
import { GameId } from "../../convex/aiTown/ids";
import { canVote } from "./Game";
import { useSendInput } from "../hooks/sendInput";
import { VoteModal } from "./VoteModal";
import { useState } from "react";

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
  return (
    <VoteModal 
      compact={true} 
      game={game} 
      engineId={engineId} 
      playerId={playerId} 
      maxVotes={1} 
      votes={votes} 
      onVote={(newVotes) => {
        setVotes(newVotes);
        inputVote({voter: playerId, votedPlayerIds: newVotes});
      }} 
    />
  );
}

