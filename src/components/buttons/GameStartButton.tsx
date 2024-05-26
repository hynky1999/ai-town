import Button from './Button';
import { toast } from 'react-toastify';
import interactImg from '../../../assets/interact.svg';
import { useConvex, useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
// import { SignInButton } from '@clerk/clerk-react';
import { ConvexError } from 'convex/values';
import { Id } from '../../../convex/_generated/dataModel';
import { useCallback } from 'react';
import { waitForInput } from '../../hooks/sendInput';
import { useServerGame } from '../../hooks/serverGame';
import { Game } from '../../../convex/aiTown/game.ts';

export default function GameStartButton() {
  // const { isAuthenticated } = useConvexAuth();
  const worldStatus = useQuery(api.world.defaultWorldStatus);
  const worldId = worldStatus?.worldId;
  const game = useServerGame(worldId) as Game;
  const humanTokenIdentifier = useQuery(api.world.userStatus, worldId ? { worldId } : 'skip');
  const userPlayerId =
    game && [...game.world.players.values()].find((p) => p.human === humanTokenIdentifier)?.id;
  const start = useMutation(api.world.startGame);
  const leave = useMutation(api.world.leaveWorld);
  const isPlaying = !!userPlayerId;

  const cycleState = game?.world.gameCycle.cycleState;

  const convex = useConvex();
  const startInput = useCallback(
    async (worldId: Id<'worlds'>) => {
      try {
        await start({ worldId });
      } catch (e: any) {
        if (e instanceof ConvexError) {
          toast.error(e.data);
          return;
        }
        throw e;
      }

    },
    [convex],
  );

  const StartGame = () => {
    if (
      !worldId ||
      // || !isAuthenticated
      game === undefined
    ) {
      return;
    }
    if (!isPlaying) {
      console.log(`Join the game first`);
    } else if (cycleState != 'LobbyState') {
      console.log(`Already started`);
    } else {
      console.log(`Starting the game`);
      void startInput(worldId)
      // game.assignRoles()
      // game.world.gameCycle.startNormal()
    }
  };
  // if (!isAuthenticated || game === undefined) {
  //   return (
  //     <SignInButton>
  //       <button className="button text-white shadow-solid text-2xl pointer-events-auto">
  //         <div className="inline-block bg-clay-700">
  //           <span>
  //             <div className="inline-flex h-full items-center gap-4">
  //               <img className="w-4 h-4 sm:w-[30px] sm:h-[30px]" src={interactImg} />
  //               Interact
  //             </div>
  //           </span>
  //         </div>
  //       </button>
  //     </SignInButton>
  //   );
  // }
  return (
    <Button imgUrl={interactImg} onClick={StartGame}>
      {isPlaying ? 'Leave' : 'Interact'}
    </Button>
  );
}
