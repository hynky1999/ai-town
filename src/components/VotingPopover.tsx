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

export default function Component(
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
  const llms = [...game.world.players.values()].filter(p => p.human)

  const maxVotes = 10
  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} className="lg:block">
        Choose LLM
      </Button>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Choose LLM"
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
        <h2 className="text-2xl font-bold text-center mb-8">Which players are LLMs ? (Choose up to {maxVotes} players)</h2>
        <div className="max-w-[600px] w-full mx-auto">
          <VoteModal compact={false} votes={votes} onVote={setVotes} engineId={engineId} game={game} playerId={playerId} maxVotes={10} />
        </div>
      </Modal>
    </>
  )
}
