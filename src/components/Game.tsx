import { useRef, useState } from 'react';
import PixiGame from './PixiGame.tsx';

import { useElementSize } from 'usehooks-ts';
import { Stage } from '@pixi/react';
import { ConvexProvider, useConvex, useQuery } from 'convex/react';
import PlayerDetails from './PlayerDetails.tsx';
import { api } from '../../convex/_generated/api';
import { useWorldHeartbeat } from '../hooks/useWorldHeartbeat.ts';
import { useHistoricalTime } from '../hooks/useHistoricalTime.ts';
import { DebugTimeManager } from './DebugTimeManager.tsx';
import { GameId } from '../../convex/aiTown/ids.ts';
import { Game as GameObj} from '../../convex/aiTown/game.ts';
import { ServerGame, useServerGame } from '../hooks/serverGame.ts';
import { GameCycle } from '../../convex/aiTown/gameCycle.ts';
import { PlayerDescription } from '../../convex/aiTown/playerDescription.ts';
import { Cloud } from './Cloud.tsx';
import VotingPopover from './LLMVote.tsx';
import { createPortal } from 'react-dom';
import GameVote from './GameVote.tsx';
import { EndGame } from './EndGame.tsx';

export const SHOW_DEBUG_UI = !!import.meta.env.VITE_SHOW_DEBUG_UI;

export function GameStateLabel(game: GameObj, me: PlayerDescription | undefined) {
  switch (game.world.gameCycle.cycleState) {
    case 'Day':
      return {
        label: 'Day',
        desc: 'Find out who is a werewolf',
      };
    case 'WerewolfVoting':
      return {
        label: 'Werewolf Vote',
        desc: 'Select a player who is a warewolf',
      };
    case 'PlayerKillVoting':
      return {
        label: 'Player Kill Vote',
        desc: me?.type === 'werewolf' ? 'Select a player to kill' : 'Hide in your home!!',
      };
    case 'LobbyState':
      return {
        label: 'Lobby (waiting for start)',
        desc: 'Waiting for the game to start',
      };
    case 'Night':
      return {
        label: 'Night',
        desc: me?.type === 'werewolf' ? 'Discuss who to kill with other warewolves' : 'Hide in your home!!',
      };
    case 'EndGame':
      return {
        label: 'The End',
        desc: `Winners are ${ game.world.winner }!`,
      };
  }
}

export function canVote(game: ServerGame, me: PlayerDescription | undefined) {
  return me && (game.world.gameCycle.cycleState === "WerewolfVoting" || (game.world.gameCycle.cycleState === "PlayerKillVoting" && me.type === "werewolf"));
}

export function isEndGame(game: ServerGame) {
  return game.world.gameCycle.cycleState === "EndGame";
}

function showMap(gameCycle: GameCycle, me: PlayerDescription | undefined) {
  // Here also check for player description
  return (gameCycle.cycleState === "Day" || gameCycle.cycleState === "WerewolfVoting") || me?.type === "werewolf";
}

export default function Game() {
  const convex = useConvex();
  const [selectedElement, setSelectedElement] = useState<{
    kind: 'player';
    id: GameId<'players'>;
  }>();
  const [gameWrapperRef, { width, height }] = useElementSize();
  const worldStatus = useQuery(api.world.defaultWorldStatus);
  const worldId = worldStatus?.worldId;
  const engineId = worldStatus?.engineId;

  const game = useServerGame(worldId);

  // Send a periodic heartbeat to our world to keep it alive.
  useWorldHeartbeat();

  const worldState = useQuery(api.world.worldState, worldId ? { worldId } : 'skip');
  const { historicalTime, timeManager } = useHistoricalTime(worldState?.engine);

  const scrollViewRef = useRef<HTMLDivElement>(null);

  const humanTokenIdentifier = useQuery(api.world.userStatus, worldId ? { worldId } : 'skip');
  if (!worldId || !engineId || !game ) {
    return null;
  }
  const playerId = [...game.world.players.values()].find(
    (p) => p.human === humanTokenIdentifier,
  )?.id;
  const meDescription = playerId ? game?.playerDescriptions.get(playerId) : undefined;
  return (
    <>
      {SHOW_DEBUG_UI && <DebugTimeManager timeManager={timeManager} width={200} height={100} />}
      <div className="mx-auto w-full max-w grid grid-rows-[240px_1fr] lg:grid-rows-[1fr] lg:grid-cols-[1fr_auto] lg:grow max-w-[1400px] min-h-[480px] game-frame">
        {/* Game area */}
        <div className="relative overflow-hidden bg-brown-900" ref={gameWrapperRef}>
          <div className={`absolute inset-0 ${showMap(game.world.gameCycle, meDescription) ? '' : 'invisible' }`}>
            <div className="container">
              <Stage width={width} height={height} options={{ backgroundColor: 0x7ab5ff }}>
                {/* Re-propagate context because contexts are not shared between renderers.
https://github.com/michalochman/react-pixi-fiber/issues/145#issuecomment-531549215 */}
                <ConvexProvider client={convex}>
                  <PixiGame
                    game={game}
                    worldId={worldId}
                    engineId={engineId}
                    width={width}
                    height={height}
                    historicalTime={historicalTime}
                    setSelectedElement={setSelectedElement}
                  />
                </ConvexProvider>
              </Stage>
            </div>
          </div>
          <div className={`absolute inset-0 ${!showMap(game.world.gameCycle, meDescription) ? '' : 'invisible' }`}>
            <Cloud worldId={worldId} />
          </div>
        </div>
        {/* Right column area */}
        <div
          className="flex flex-col overflow-y-auto shrink-0 px-4 py-6 sm:px-6 lg:w-96 xl:pr-6 border-t-8 sm:border-t-0 sm:border-l-8 border-brown-900  bg-brown-800 text-brown-100"
          ref={scrollViewRef}
        >
          <div className="flex flex-col items-center mb-4 gap-4">
            <h2 className="text-2xl font-bold">{GameStateLabel(game as GameObj, meDescription).label}</h2>
            <p className="text-lg text-center">{GameStateLabel(game as GameObj, meDescription).desc}</p>
          </div>
          {playerId && !isEndGame(game) && canVote(game, meDescription) && <GameVote engineId={engineId} game={game} playerId={playerId} />}
          {!isEndGame(game) && !canVote(game, meDescription) && <PlayerDetails
            worldId={worldId}
            engineId={engineId}
            game={game}
            playerId={selectedElement?.id}
            setSelectedElement={setSelectedElement}
            scrollViewRef={scrollViewRef}
          />}
          {playerId && isEndGame(game) && <EndGame game={game} playerId={playerId} />}
        </div>
      </div>
      {createPortal(
          <div className="max-w-[1400px] mx-auto">
        {playerId && <VotingPopover engineId={engineId} game={game} playerId={playerId} />}
          </div>,
          document.getElementById('footer-buttons')
      )}
    </>
  );
}
