import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import FFT from "fft.js";
import { getFundamentalFrequenciesFromFftData } from "../utils/piano-utils";

const audioContext = new AudioContext();
export const analyserNode = audioContext.createAnalyser();

const fft = new FFT(analyserNode.fftSize);
export const sampleRate = audioContext.sampleRate;

export function useAudioProcessing() {
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
        null
    );
    const [error, setError] = useState<string | null>(null);
    const [audioData, setAudioData] = useState<Float32Array>(
        new Float32Array(analyserNode.fftSize)
    );
    const [fftData, setFftData] = useState<Float32Array>(
        new Float32Array(analyserNode.fftSize)
    );
    const [isRecording, setIsRecording] = useState(false);
    const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const intervalIdRef = useRef<number | null>(null);

    const fundamentalFrequencies = useMemo(
        () => getFundamentalFrequenciesFromFftData(fftData, sampleRate),
        [fftData]
    );

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                const mediaRecorder = new MediaRecorder(stream);
                setMediaRecorder(mediaRecorder);
                audioSourceRef.current =
                    audioContext.createMediaStreamSource(stream);
            })
            .catch((err) => {
                setError("Error loading media recorder");
                console.error("Error loading media recorder", err);
            });

        return () => {
            if (audioSourceRef.current) {
                audioSourceRef.current.disconnect();
            }
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
            }
        };
    }, []);

    const startRecording = useCallback(() => {
        if (mediaRecorder && !isRecording) {
            mediaRecorder.start();
            if (mediaRecorder.state === "recording") {
                setIsRecording(true);
                setError(null);

                if (audioSourceRef.current) {
                    audioSourceRef.current.connect(analyserNode);
                    intervalIdRef.current = window.setInterval(() => {
                        const newAudioData = new Float32Array(
                            analyserNode.fftSize
                        );
                        analyserNode.getFloatFrequencyData(newAudioData);
                        setAudioData(newAudioData);

                        const timeDomainData = new Float32Array(
                            analyserNode.fftSize
                        );
                        analyserNode.getFloatTimeDomainData(timeDomainData);

                        const complexOutput = fft.createComplexArray();
                        fft.realTransform(complexOutput, timeDomainData);
                        fft.completeSpectrum(complexOutput);

                        // Calculate corresponding frequencies for each bin
                        const magnitudes = new Float32Array(
                            analyserNode.fftSize / 2
                        );

                        for (let i = 0; i < analyserNode.fftSize / 2; i++) {
                            const real = complexOutput[2 * i];
                            const imag = complexOutput[2 * i + 1];
                            magnitudes[i] = Math.sqrt(
                                real * real + imag * imag
                            );
                        }

                        const max = magnitudes.reduce(
                            (acc, val) => Math.max(acc, val),
                            0
                        );

                        // Normalize magnitudes
                        magnitudes.forEach((val, i) => {
                            magnitudes[i] = val / max;
                        });

                        setFftData(magnitudes);
                    }, 100);
                }
            } else {
                setError("Error starting media recorder");
            }
        } else if (!mediaRecorder) {
            setError("Media recorder not loaded");
        }
    }, [mediaRecorder, isRecording]);

    const stopRecording = useCallback(() => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            if (mediaRecorder.state === "inactive") {
                setIsRecording(false);
                setError(null);

                if (audioSourceRef.current) {
                    audioSourceRef.current.disconnect(analyserNode);
                }
                if (intervalIdRef.current) {
                    clearInterval(intervalIdRef.current);
                    intervalIdRef.current = null;
                }
            } else {
                setError("Error stopping media recorder");
            }
        } else if (!mediaRecorder) {
            setError("Media recorder not loaded");
        }
    }, [mediaRecorder, isRecording]);

    return {
        startRecording,
        stopRecording,
        error,
        audioData: fftData.slice(0, 200),
        isRecording,
        fftData,
        fundamentalFrequencies,
    };
}
