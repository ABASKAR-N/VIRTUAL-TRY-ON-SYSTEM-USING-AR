import { useState, useEffect, useRef } from 'react';
import { FilesetResolver, PoseLandmarker, FaceLandmarker } from '@mediapipe/tasks-vision';

export type LoadingPhase = 'idle' | 'runtime' | 'pose' | 'face' | 'ready' | 'error';

export function useMediaPipe() {
    const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
    const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [phase, setPhase] = useState<LoadingPhase>('idle');
    const [progress, setProgress] = useState(0);
    const [loadingStatus, setLoadingStatus] = useState('Initializing...');
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        async function initModels() {
            try {
                setPhase('runtime');
                setProgress(10);
                setLoadingStatus('Loading Vision Runtime...');
                const vision = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
                );

                setPhase('pose');
                setProgress(40);
                setLoadingStatus('Loading Pose Model...');
                const pose = await PoseLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numPoses: 1,
                });

                setPhase('face');
                setProgress(75);
                setLoadingStatus('Loading Face Model...');
                const face = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numFaces: 1,
                });

                setPoseLandmarker(pose);
                setFaceLandmarker(face);
                setProgress(100);
                setPhase('ready');
                setIsLoaded(true);
                setLoadingStatus('AI Ready');
            } catch (error) {
                console.error('MediaPipe init error:', error);
                setPhase('error');
                setLoadingStatus('Failed to load AI models');
            }
        }

        initModels();
    }, []);

    return { poseLandmarker, faceLandmarker, isLoaded, phase, progress, loadingStatus };
}
