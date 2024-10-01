import { useState } from "react";
import {
    DOTTED_FRETS,
    getNoteFromFrequency,
    getNoteFromFretAndString,
    NUM_OF_FRETS,
    NUM_OF_STRINGS,
    useGuitarState,
} from "../utils/piano-utils";
import { twMerge } from "tailwind-merge";

function GuitarNoteComp({
    fret,
    string,
    onClick,
    isShowing,
    isError,
    hideNoteText = false,
    onChange,
}: {
    fret: number;
    string: number;
    onClick?: () => void;
    isShowing: boolean;
    hideNoteText?: boolean;
    isError: boolean;
    onChange?: (value: string) => void;
}) {
    const note = getNoteFromFretAndString(fret, string);
    const isDoubleDotted = fret + 1 == 12 && (string === 1 || string === 5);
    const isDotted = isDoubleDotted
        ? true
        : DOTTED_FRETS.includes(fret + 1) && string === 3;

    const [isHovering, setIsHovering] = useState(false);

    const handleMouseEnter = () => {
        setIsHovering(true);
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
    };

    return (
        <div
            style={{
                height: `${100 / NUM_OF_STRINGS}%`,
            }}
            className="relative cursor-pointer z-[100]"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
        >
            {isDotted && (
                <div
                    style={{
                        width: "1rem",
                        height: "1rem",
                        backgroundColor: "white",
                        opacity: 0.7,
                        borderRadius: "50%",
                        top: "100%",
                        left: "55%",
                        transform: "translate(-50%, -50%)",
                    }}
                    className="absolute"
                ></div>
            )}
            {isShowing && (
                <div
                    className={twMerge(
                        "z-10 w-8 h-8 top-[9px] left-[55%] -translate-x-1/2 absolute rounded-full flex justify-center items-center",
                        isError ? "bg-red-500" : "bg-green-500"
                    )}
                >
                    {!hideNoteText && (
                        <p>
                            {note.note}
                            {note.octave}
                        </p>
                    )}
                    {hideNoteText && onChange && (
                        <input
                            className="w-8 h-8 bg-transparent absolute top-0 left-0"
                            onChange={(e) => onChange(e.target.value)}
                        />
                    )}
                </div>
            )}
            {isHovering && (
                <div
                    style={{
                        opacity: 0.6,
                    }}
                    className="w-8 h-8 top-[9px] left-[55%] -translate-x-1/2 bg-blue-500 absolute rounded-full flex justify-center items-center"
                ></div>
            )}
        </div>
    );
}
function GuitarNote({ fret, string }: { fret: number; string: number }) {
    const note = getNoteFromFretAndString(fret, string);
    const {
        notes: noteFrequencies,
        setGuesses,
        guesses,
        noteBeingGuessed,
        gameMode,
        notesToGuess,
    } = useGuitarState();

    switch (gameMode) {
        case "place": {
            const notes = noteFrequencies.map((frequency) => {
                const note = getNoteFromFrequency(frequency);
                return note;
            });

            const isGuessed = guesses.some(
                (n) => n.fret === fret && n.string === string
            );

            const isHighlighted = notes.some(
                (n) => n.note === note.note && n.octave === note.octave
            );
            const isGuessCorrect = isGuessed && noteBeingGuessed === note.note;

            const handleGuess = () => {
                if (isGuessed) {
                    setGuesses(
                        guesses.filter(
                            (n) => n.fret !== fret || n.string !== string
                        )
                    );
                    return;
                }
                setGuesses([...guesses, { fret, string }]);
            };

            return (
                <GuitarNoteComp
                    fret={fret}
                    string={string}
                    onClick={handleGuess}
                    isShowing={isHighlighted || isGuessed}
                    isError={!isGuessCorrect}
                />
            );
        }
        case "guess": {
            const isGuessedCorrectly = guesses.some(
                (n) => n.fret === fret && n.string === string
            );
            const isHighlighted = notesToGuess.some(
                (n) => n.fret === fret && n.string === string
            );

            const handleChange = (value: string) => {
                if (value.toUpperCase() === note.note.toUpperCase()) {
                    setGuesses([...guesses, { fret, string }]);
                }
            };

            return (
                <GuitarNoteComp
                    fret={fret}
                    string={string}
                    isShowing={isHighlighted}
                    onChange={handleChange}
                    isError={!isGuessedCorrectly}
                    hideNoteText={!isGuessedCorrectly}
                />
            );
        }
    }
}

export function Guitar() {
    return (
        <>
            <div
                style={{
                    background: `url(wood.png)`,
                    boxShadow: "2px 2px 2px 2px #00000030",
                }}
                className="h-full w-11/12 flex relative"
            >
                <div
                    style={{
                        backgroundColor: "rgba(139, 69, 19, 0.8)", // Dark brown tint with 50% opacity                        backgroundBlendMode: "overlay",
                        backgroundBlendMode: "multiply",
                    }}
                    className="h-full w-full absolute"
                ></div>
                <div className="absolute w-full h-full flex">
                    {Array.from({ length: NUM_OF_FRETS }, (_, fret) => (
                        <div
                            style={{
                                width: `${100 / NUM_OF_FRETS}%`,
                            }}
                            key={fret}
                            className="h-full flex flex-col-reverse relative"
                        >
                            <div
                                style={{
                                    background:
                                        "linear-gradient(90deg, #777777, #d0d0d0, #f0f0f0, #d0d0d0, #777777)",
                                }}
                                className="h-full w-2 bg-black absolute"
                            ></div>
                            {Array.from(
                                { length: NUM_OF_STRINGS },
                                (_, string) => (
                                    <GuitarNote
                                        key={
                                            string.toString() + fret.toString()
                                        }
                                        fret={fret}
                                        string={string}
                                    />
                                )
                            )}
                        </div>
                    ))}
                </div>

                <div className="absolute w-full h-full">
                    {Array.from({ length: NUM_OF_STRINGS }, (_, string) => (
                        <div
                            style={{
                                height: `${100 / NUM_OF_STRINGS}%`,
                            }}
                            key={string}
                            className="relative"
                        >
                            <div
                                style={{
                                    background:
                                        "linear-gradient(0deg, #444444, #909090, #d0d0d0, #909090, #444444)",
                                    boxShadow: "0 0 5px 5px #00000010",
                                    height: string >= 3 ? "6px" : "4px",
                                }}
                                className="absolute  top-6 w-full"
                            ></div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
