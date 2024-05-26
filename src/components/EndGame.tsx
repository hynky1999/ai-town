import { ServerGame } from "@/hooks/serverGame"
import { GameId } from "../../convex/aiTown/ids";

export function EndGame({
  game,
  playerId
}: {
  game: ServerGame
  playerId: GameId<'players'>
}) {
    const llms = [...game.world.players.values()].filter(player => player.human);
    const playerVotes = [...game.world.llmVotes].filter((vote) => vote.voter === playerId);
    if (playerVotes.length === 0) {
        return <p>You didn't vote</p>
    }
    const correctVotes = playerVotes[0].playerIds.filter((playerId) => llms.map(llm => llm.id).includes(playerId));
    return (
        <>
           <h2>LLM Voting results</h2>
           <p>You managed to guess {correctVotes.length} out of {llms.length}</p>
           <p>The LLM were: {llms.map(llm => game.playerDescriptions.get(llm.id)?.name).join(', ')}</p>
        </>
    )
}

