import { useEffect } from "react";
import { Guitar } from "./components/guitar";
import { getNoteFrequency, Note, useGuitarState } from "./utils/piano-utils";
import { FaRandom } from "react-icons/fa";

function App() {
    const {
        setNotes,
        notes,
        setGuesses,
        noteBeingGuessed,
        setNoteBeingGuessed,
    } = useGuitarState();

    useEffect(() => {
        handleSelectRandomNote();
    }, []);

    const handleSelectRandomNote = () => {
        const notesList = Object.values(Note);
        let randomNote =
            notesList[Math.floor(Math.random() * notesList.length)];
        while (randomNote === noteBeingGuessed) {
            randomNote =
                notesList[Math.floor(Math.random() * notesList.length)];
        }
        setNoteBeingGuessed(randomNote);
        setGuesses([]);
        setNotes([]);
    };

    const handleSubmit = () => {
        if (!noteBeingGuessed) return;

        if (notes.length > 0) {
            setNotes([]);
            return;
        }

        const freqs = [3, 4, 5, 6, 7].map((octave) =>
            getNoteFrequency(noteBeingGuessed, octave)
        );
        setNotes(freqs);
    };

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
                <div>
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
                        className="text-lg"
                    >
                        A tool to help you master the fretboard
                    </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <p
                        style={{
                            background: `url(wood.png)`,
                            backgroundSize: "cover",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            textShadow: "0px 0px 0px #FFFFFF99",
                            filter: "drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8))",
                        }}
                        className="font-semibold text-9xl drop-shadow-lg"
                    >
                        {noteBeingGuessed?.toUpperCase()}
                    </p>
                    <div className="flex gap-2">
                        <button
                            className="bg-gradient-to-t from-red-900 to-red-700 font-semibold text-white px-4 py-2 rounded-lg"
                            onClick={handleSelectRandomNote}
                        >
                            New note
                            <FaRandom className="inline-block ml-2" />
                        </button>
                        <button
                            style={{
                                background:
                                    "-webkit-linear-gradient(#ede8d0, #c9c5b1)",
                            }}
                            className="bg-gradient-to-t  font-semibold text-black px-4 py-2 rounded-lg"
                            onClick={handleSubmit}
                        >
                            {notes.length === 0 ? "Reveal" : "Hide"} notes
                        </button>
                    </div>
                </div>
                <div className="h-[300px] w-full flex flex-col items-center">
                    <Guitar />
                </div>
            </div>
        </div>
    );
}

export default App;
