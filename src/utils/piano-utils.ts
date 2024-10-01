import { create } from "zustand";

export enum Note {
  C = "c",
  CSharp = "c#",
  D = "d",
  DSharp = "d#",
  E = "e",
  F = "f",
  FSharp = "f#",
  G = "g",
  GSharp = "g#",
  A = "a",
  ASharp = "a#",
  B = "b",
}

export const NOTES = {
  [Note.C]: 16.35,
  [Note.CSharp]: 17.32,
  [Note.D]: 18.35,
  [Note.DSharp]: 19.45,
  [Note.E]: 20.6,
  [Note.F]: 21.83,
  [Note.FSharp]: 23.12,
  [Note.G]: 24.5,
  [Note.GSharp]: 25.96,
  [Note.A]: 27.5,
  [Note.ASharp]: 29.14,
  [Note.B]: 30.87,
};

export const NUM_OF_FRETS = 23;
export const NUM_OF_STRINGS = 6;

export const DOTTED_FRETS = [3, 5, 7, 9, 15, 17, 19, 21];

export function getNoteFrequency(note: Note, octave: number) {
  const noteFrequency = NOTES[note];
  return noteFrequency * Math.pow(2, octave);
}

export function addSemitoneToNote(
  note: Note,
  octave: number,
  semitone: number
) {
  const notesList = Object.values(Note);
  const noteIndex = notesList.indexOf(note);
  const newSemitone = noteIndex + semitone;

  const newNote = {
    note: notesList[newSemitone % notesList.length],
    octave: octave + Math.floor(newSemitone / notesList.length),
  };

  return newNote;
}

function getBaseNoteOfString(string: number) {
  const base = {
    note: Note.E,
    octave: 4,
  };

  if (string === 0) {
    return base;
  }

  if (string >= 4) {
    return addSemitoneToNote(base.note, base.octave, 4 + 5 * (string - 1));
  }
  return addSemitoneToNote(base.note, base.octave, 5 * string);
}

export function getNoteFromFretAndString(fret: number, string: number) {
  const { note, octave } = getBaseNoteOfString(string);

  return addSemitoneToNote(note, octave, fret + 1);
}

function getAllNoteFrequencies() {
  const notesList = []
  // add several octaves
  for (let i = 0; i < 10; i++) {
    const newNotes = Object.values(Note).map((note) => {
      return {
        note: note,
        octave: i,
      }
    });
    notesList.push(...newNotes);
  }

  return notesList;
}

const notesList = getAllNoteFrequencies();

export function getNoteFromFrequency(frequency: number) {
  // find closest frequency

  const closestNote = notesList.reduce((prev, curr) => {
    const prevFrequency = getNoteFrequency(prev.note, prev.octave);
    const currFrequency = getNoteFrequency(curr.note, curr.octave);
    return Math.abs(frequency - currFrequency) < Math.abs(frequency - prevFrequency) ? curr : prev;
  });

  if (!closestNote) {
    return {
      note: Note.C,
      octave: 4,
    }
  }
  const octave = closestNote.octave;

  return {
    note: closestNote.note,
    octave,
  };
}

export type GuitarNote = {
  fret: number;
  string: number;
}

export type GameMode = "place" | "guess";

type GuitarStateStore = {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;

  // place mode
  notes: number[];
  setNotes: (notes: number[]) => void;
  guesses: GuitarNote[];
  setGuesses: (guesses: GuitarNote[]) => void;
  noteBeingGuessed: Note | null;
  setNoteBeingGuessed: (note: Note) => void;

  // guess mode
  notesGuessed: Note[];
  setNotesGuessed: (notes: Note[]) => void;
  notesToGuess: GuitarNote[];
  setNotesToGuess: (notes: GuitarNote[]) => void;
};

export const useGuitarStore = create<GuitarStateStore>((set) => ({
  gameMode: "place",
  setGameMode: (mode) => set({ gameMode: mode }),
  notes: [],
  notesToGuess: [],
  guesses: [],
  notesGuessed: [],
  noteBeingGuessed: null,
  setNotesGuessed: (notes) => set({ notesGuessed: notes }),
  setNotesToGuess: (notes) => set({ notesToGuess: notes }),
  setNoteBeingGuessed: (note) => set({ noteBeingGuessed: note }),
  setNotes: (notes) => set({ notes }),
  setGuesses: (guesses) => set({ guesses }),
}));

export const useGuitarState = () => useGuitarStore((state) => state);

export function getFundamentalFrequenciesFromFftData(
  fftData: Float32Array,
  sampleRate: number
) {
  const fundamentalFrequencies = [];
  const thresholdRatio = 0.8; // Dynamic threshold relative to local max peaks
  const detectedFrequencies = [];

  // Detect peaks in the FFT data
  for (let i = 1; i < fftData.length - 1; i++) {
    if (fftData[i] > fftData[i - 1] && fftData[i] > fftData[i + 1]) {
      // Found a peak
      const peakValue = fftData[i];
      const frequency = (sampleRate * i) / fftData.length;

      // Apply threshold based on local peaks
      const maxPeak = Math.max(...fftData);
      if (peakValue > thresholdRatio * maxPeak) {
        detectedFrequencies.push(frequency);
      }
    }
  }

  // Harmonic filtering: Filter out frequencies that are likely harmonics of earlier ones
  for (let i = 0; i < detectedFrequencies.length; i++) {
    const freq = detectedFrequencies[i];
    let isHarmonic = false;

    // Check for harmonic relationships with previous detected frequencies
    for (let j = 0; j < fundamentalFrequencies.length; j++) {
      const fundamental = fundamentalFrequencies[j];
      if (
        Math.abs(freq / fundamental - Math.round(freq / fundamental)) <
        0.1
      ) {
        isHarmonic = true; // It's a harmonic
        break;
      }
    }

    // If it's not a harmonic, consider it a fundamental frequency
    if (!isHarmonic) {
      fundamentalFrequencies.push(freq);
    }
  }

  return fundamentalFrequencies;
}
