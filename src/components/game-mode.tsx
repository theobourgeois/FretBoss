import { useEffect, useState } from "react";
import {
    addSemitoneToNote,
    getNoteFrequency,
    GuitarNote,
    Note,
    NUM_OF_FRETS,
    NUM_OF_STRINGS,
    useGuitarState,
} from "../utils/piano-utils";
import { FaPlay, FaRandom } from "react-icons/fa";

const audioContext = new AudioContext();

const playNote = (randomNote: Note | null) => {
    if (!randomNote) return;
    const oscillator = audioContext.createOscillator();
    const freq = getNoteFrequency(randomNote, 4);
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
};

const getRandomNote = (noteBeingGuessed: Note | null) => {
    const notesList = Object.values(Note);
    let randomNote = notesList[Math.floor(Math.random() * notesList.length)];
    while (randomNote === noteBeingGuessed) {
        randomNote = notesList[Math.floor(Math.random() * notesList.length)];
    }

    return randomNote;
};

export function GameMode() {
    const {
        gameMode,
        noteBeingGuessed,
        setNotes,
        notes,
        setNoteBeingGuessed,
        setGuesses,
        setNotesToGuess,
        notesToGuess,
        intervalData,
        setIntervalData,
    } = useGuitarState();
    const [numberOfNotesToGuess, setNumberOfNotesToGuess] = useState(5);
    const [setInterval, setSetInterval] = useState<number | null>(5);

    useEffect(() => {
        handleSelectRandomFretAndString();
        handleSelectRandomNote();
    }, []);

    const handleSelectRandomFretAndString = () => {
        const newNotes: GuitarNote[] = [];
        for (let i = 0; i < numberOfNotesToGuess; i++) {
            let fret;
            const randomPercentage = Math.random();
            if (randomPercentage < 0.4) {
                fret = Math.floor(Math.random() * 6) + 1; // Frets 1 to 6
            } else if (randomPercentage < 0.8) {
                fret = Math.floor(Math.random() * 4) + 7; // Frets 7 to 10
            } else {
                fret = Math.floor(Math.random() * (NUM_OF_FRETS - 10)) + 11; // Frets 11 to NUM_OF_FRETS
            }
            fret -= 1;
            const string = Math.floor(Math.random() * NUM_OF_STRINGS) + 1;
            newNotes.push({ fret, string });
        }
        setNotesToGuess(newNotes);
        setGuesses([]);
    };

    const handleSelectRandomNote = () => {
        const randomNote = getRandomNote(noteBeingGuessed);
        setNoteBeingGuessed(randomNote);
        setGuesses([]);
        setNotes([]);
    };

    switch (gameMode) {
        case "place": {
            const handleRevealNotesPlaceNotes = () => {
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
                            onClick={() => playNote(noteBeingGuessed)}
                        >
                            Play note
                            <FaPlay className="inline-block ml-2" />
                        </button>
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
                            onClick={handleRevealNotesPlaceNotes}
                        >
                            {notes.length === 0 ? "Reveal" : "Hide"} notes
                        </button>
                    </div>
                </div>
            );
        }
        case "guess": {
            const handleRevealNotesGuessNotes = () => {
                setGuesses([...notesToGuess]);
            };

            return (
                <div className="flex items-end gap-2">
                    <div className="flex flex-col gap-1">
                        <label
                            className="text-white"
                            htmlFor="numberOfNotesToGuess"
                        >
                            Number of notes to guess:
                        </label>

                        <input
                            type="number"
                            className="rounded-lg px-2 py-1"
                            value={numberOfNotesToGuess}
                            onChange={(e) =>
                                setNumberOfNotesToGuess(
                                    parseInt(e.target.value)
                                )
                            }
                        />
                    </div>
                    <button
                        className="bg-gradient-to-t from-red-900 to-red-700 font-semibold text-white px-4 py-2 rounded-lg"
                        onClick={handleSelectRandomFretAndString}
                    >
                        New notes
                        <FaRandom className="inline-block ml-2" />
                    </button>
                    <button
                        style={{
                            background:
                                "-webkit-linear-gradient(#ede8d0, #c9c5b1)",
                        }}
                        className="bg-gradient-to-t  font-semibold text-black px-4 py-2 rounded-lg"
                        onClick={handleRevealNotesGuessNotes}
                    >
                        {notes.length === 0 ? "Reveal" : "Hide"} notes
                    </button>
                </div>
            );
        }
        case "interval1": {
            const handleSubmit = (e: React.FormEvent) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const note = formData.get("note") as Note;
                const correctNote = addSemitoneToNote(
                    intervalData.note,
                    4,
                    5
                ).note;

                if (note.toLowerCase() === correctNote.toLowerCase()) {
                    alert("Correct!");
                    const randomNote = getRandomNote(note);
                    const newInterval = setInterval
                        ? setInterval
                        : Math.floor(Math.random() * 12) + 1;

                    setIntervalData({
                        note: randomNote,
                        interval: newInterval,
                    });
                } else {
                    alert("Incorrect!");
                }
            };

            return (
                <div className="flex flex-col items-center  gap-2">
                    <div className="text-white text-2xl">
                        <p className="flex items-center gap-2">
                            Note:{" "}
                            <span className="font-extrabold text-5xl">
                                {intervalData.note.toUpperCase()}
                            </span>
                        </p>
                        <p className="flex items-center gap-2">
                            Interval:{" "}
                            <span className="font-extrabold text-5xl">
                                {intervalData.interval}
                            </span>
                        </p>
                    </div>
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-2"
                    >
                        <div className="flex flex-col gap-1">
                            <label
                                className="text-white"
                                htmlFor="numberOfNotesToGuess"
                            >
                                Select interval to guess
                            </label>
                            <select
                                name="interval"
                                className="rounded-lg px-2 py-1"
                                value={setInterval || "random"}
                                onChange={(e) => {
                                    if (e.target.value === "random") {
                                        setSetInterval(null);
                                    } else {
                                        setSetInterval(
                                            parseInt(e.target.value)
                                        );
                                    }
                                }}
                            >
                                <option value="random">Random</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
                                    (interval) => (
                                        <option key={interval} value={interval}>
                                            {interval}
                                        </option>
                                    )
                                )}
                            </select>
                            <div className="flex flex-col gap-1">
                                <label
                                    className="text-white"
                                    htmlFor="numberOfNotesToGuess"
                                >
                                    Guess the note after this interval:
                                </label>
                                <input
                                    type="text"
                                    className="rounded-lg px-2 py-1"
                                    name="note"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="bg-gradient-to-t  font-semibold text-white px-4 py-2 rounded-lg from-red-800 to-red-600">
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            );
        }
    }
}
