import Game from './components/Game.tsx';

import { ToastContainer } from 'react-toastify';
import a16zImg from '../assets/a16z.png';
import convexImg from '../assets/convex.svg';
import starImg from '../assets/star.svg';
import helpImg from '../assets/help.svg';
// import { UserButton } from '@clerk/clerk-react';
// import { Authenticated, Unauthenticated } from 'convex/react';
// import LoginButton from './components/buttons/LoginButton.tsx';
import { useState } from 'react';
import ReactModal from 'react-modal';
import MusicButton from './components/buttons/MusicButton.tsx';
import Button from './components/buttons/Button.tsx';
import InteractButton from './components/buttons/InteractButton.tsx';
import OAuthLogin from './components//buttons/OAuthLogin.tsx';
import FreezeButton from './components/FreezeButton.tsx';
import { MAX_HUMAN_PLAYERS } from '../convex/constants.ts';
import PoweredByConvex from './components/PoweredByConvex.tsx';

export default function Home() {
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between font-body game-background">

<ReactModal
        isOpen={helpModalOpen}
        onRequestClose={() => setHelpModalOpen(false)}
        style={modalStyles}
        contentLabel="Help modal"
        ariaHideApp={false}
      >
        <div className="font-body">
          <h1 className="text-center text-6xl font-bold font-display game-title">Help</h1>
          <p>
            Welcome to Matou Garou. To play, you have to be logged in{' '}
            <i>as player</i>.
          </p>
          <h2 className="text-4xl mt-4">Spectating</h2>
          <p>
            Click and drag to move around the village, and scroll in and out to zoom. You can click on
            an individual character to view its chat history.
          </p>
          <h2 className="text-4xl mt-4">Playing</h2>
          <p>
            If you log in, you can join the game and directly interact with different characters! After
            logging in, click the "Play" button, and your character will appear somewhere in the village with a highlighted circle underneath you.
          </p>
          <p className="text-2xl mt-2">Controls:</p>
          <p className="mt-4">Click to navigate around.</p>
          <p className="mt-4">
            To talk to a character, click on them and then click "Start conversation," which will ask
            them to start walking towards you. Once they're nearby, the conversation will start, and
            you can speak to each other. You can leave at any time by closing the conversation pane
            or moving away. They may propose a conversation to you - you'll see a button to accept
            in the messages panel.
          </p>
            <h2 className="text-4xl mt-4">Rules</h2>
                <p>
                    When the game starts, players will be assigned roles randomly (team Villagers and team Matou Garou). The primary objective is 
                    to vote against another team to kick them out of the game (the game ends once there's no members left of one of the teams).
                    The bonus objective is to discover which players are actually powered by an LLM (you can vote at any moment even if your character was kicked out).
                </p>
          <p className="mt-4">
            Matou Garou only supports {MAX_HUMAN_PLAYERS} human players at a time. If you're idle for five
            minutes, you'll be automatically removed from the game.
          </p>
        </div>
      </ReactModal>
      {/*<div className="p-3 absolute top-0 right-0 z-10 text-2xl">
        <Authenticated>
          <UserButton afterSignOutUrl="/ai-town" />
        </Authenticated>

        <Unauthenticated>
          <LoginButton />
        </Unauthenticated>
      </div> */}

<div className="w-full lg:h-screen min-h-screen relative isolate overflow-hidden lg:p-8 shadow-2xl flex flex-col justify-start">

        <Game />

        <footer className="justify-end bottom-0 left-0 w-full flex items-center mt-4 gap-3 p-6 flex-wrap pointer-events-none">
          <div className="flex gap-4 flex-grow pointer-events-none">
<FreezeButton />
            <MusicButton />
           <Button href="https://github.com/a16z-infra/ai-town" imgUrl={starImg}>
              Star
            </Button>
            <InteractButton />
            <Button imgUrl={helpImg} onClick={() => setHelpModalOpen(true)}>
              Help
            </Button>
            <OAuthLogin />
            <div id="footer-buttons"/>
          </div>
        </footer>
        <ToastContainer position="bottom-right" autoClose={2000} closeOnClick theme="dark" />
      </div>
    </main>
  );
}

const modalStyles = {
  overlay: {
    backgroundColor: 'rgb(0, 0, 0, 75%)',
    zIndex: 12,
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '50%',

    border: '10px solid rgb(23, 20, 33)',
    borderRadius: '0',
    background: 'rgb(35, 38, 58)',
    color: 'white',
    fontFamily: '"Upheaval Pro", "sans-serif"',
  },
};
