import { Guitar } from "./components/guitar";
import {
    type GameMode as GameModeType,
    useGuitarState,
} from "./utils/piano-utils";
import { GameMode } from "./components/game-mode";

function App() {
    const { gameMode, setGameMode, setNotes, setGuesses } = useGuitarState();

    return (
        <div
            style={{
                background: `url(wood-grain-texture.jpg), linear-gradient(to top, #7f1d1d, #3f0e0e)`,
                backgroundSize: "cover",
                backgroundBlendMode: "multiply",
            }}
            className="w-screen h-screen flex flex-col justify-center items-center bg-gradient-to-t to-red-900 from-red-950"
        >
            <div className="w-full gap-4 items-center flex flex-col">
                <div className="flex flex-col justify-center items-center">
                    <h1
                        style={{
                            background: `url(metal-texture.avif)`,
                            backgroundSize: "cover",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            filter: "drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8))",
                        }}
                        className="text-8xl font-bold text-center"
                    >
                        FretBoss🎸
                    </h1>
                    <p
                        style={{
                            color: "#ede8d0",
                        }}
                        className="text-lg text-center"
                    >
                        A tool to help you master the fretboard.
                    </p>
                    <div className="mt-4">
                        <p className="font-semibold text-white">
                            Select game mode:
                        </p>
                        <select
                            className="bg-gradient-to-t mt-2 w-max from-white to-slate-200 font-semibold text-black px-4 py-2 rounded-lg"
                            onChange={(e) => {
                                setGameMode(e.target.value as GameModeType);
                                setGuesses([]);
                                setNotes([]);
                            }}
                            value={gameMode}
                        >
                            <option value="place">Place notes</option>
                            <option value="guess">Guess notes</option>
                            <option value="interval1">
                                Guess the note from interval
                            </option>
                        </select>
                    </div>
                </div>
                <GameMode />

                <div className="h-[300px] w-full flex flex-col items-center">
                    <Guitar />
                </div>
            </div>
        </div>
    );
}

export default App;
