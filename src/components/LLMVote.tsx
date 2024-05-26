/**
 * v0 by Vercel.
 * @see https://v0.dev/t/OH0xMc8eRYc
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

import Button from "./buttons/Button"
import Modal from 'react-modal';
import { GameId } from "../../convex/aiTown/ids"
import { Id } from "../../convex/_generated/dataModel"
import { ServerGame } from "@/hooks/serverGame"
import { useState } from "react"
import { VoteModal } from "./VoteModal";
import { useSendInput } from "../hooks/sendInput";

export default function LLMVote(
  {
    game,
    engineId,
    playerId,
  }: {
    engineId: Id<'engines'>,
    game: ServerGame,
    playerId: GameId<'players'>,
  }
) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [votes, setVotes] = useState<GameId<'players'>[]>([]);
  const players = [...game.world.playersInit.values()].filter(
    (player) => player.id !== playerId
  )
  const inputVote = useSendInput(engineId, "llmVote");
  const totalLLMs = players.filter((player) => !player.human).length
  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} className="lg:block">
        Choose LLM
      </Button>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Choose LLM"
        ariaHideApp={false}
        className="mx-auto bg-brown-800 p-16 game-frame font-body max-w-[1000px]"
        style={{
          content: {
            position: 'absolute',
            top: '50%',
            left: '30%',
            transform: 'translate(-20%, -50%)',
          },
        }}
      >
        <h2 className="text-2xl font-bold text-center mb-8">Which players are LLMs ? (Choose up to {totalLLMs} players)</h2>
        <div className="max-w-[600px] w-full mx-auto">
          <VoteModal compact={false} votes={votes} players={players} onVote={(newVotes) => {
            setVotes(newVotes)
            inputVote({voter: playerId, votedPlayerIds: newVotes});
          }} engineId={engineId} game={game} playerId={playerId} maxVotes={totalLLMs} />
        </div>
      </Modal>
    </>
  )
}
