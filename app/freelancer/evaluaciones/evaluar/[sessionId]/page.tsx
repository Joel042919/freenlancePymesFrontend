"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Mic, Square, AlertTriangle, ShieldCheck, Code, Play } from 'lucide-react';
import { useAntiCheat, FraudEvent } from '@/hooks/useAntiCheat';
import { apiFetch } from '@/lib/api';
import Editor from '@monaco-editor/react';

type EvaluationPhase = 'VOICE_INTERVIEW' | 'PRACTICAL_SANDBOX' | 'CODE_DEFENSE' | 'COMPLETED';

export default function EvaluationSandbox() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [phase, setPhase] = useState<EvaluationPhase>('VOICE_INTERVIEW');
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [aiResponseText, setAiResponseText] = useState<string>('');
  const [fraudWarnings, setFraudWarnings] = useState<string[]>([]);
  const [code, setCode] = useState<string>('// Escribe tu código aquí\n\nfunction resolveChallenge() {\n  \n}');
  
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleFraudEvent = async (event: FraudEvent, metadata: any) => {
    const warningMsg = `Advertencia de seguridad: ${event}`;
    setFraudWarnings(prev => [...prev, warningMsg]);
    try {
      await apiFetch('/telemetry/fraud', {
        method: 'POST',
        body: JSON.stringify({ sessionId, eventType: event, metadata })
      });
    } catch (error) {
      console.error("Failed to report fraud event", error);
    }
  };

  useAntiCheat({ onFraudEvent: handleFraudEvent, isActive: phase !== 'COMPLETED' });

  useEffect(() => {
    if ((phase === 'VOICE_INTERVIEW' || phase === 'CODE_DEFENSE') && isInterviewStarted) {
      const ws = new WebSocket(`ws://localhost:8080/ws/evaluation?sessionId=${sessionId}`);
      
      ws.onopen = () => {
        console.log("WebSocket connected for AI Voice Evaluation");
      };

      ws.onmessage = async (event) => {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data);
          if (data.type === 'ai_response') setAiResponseText(data.text);
          if (data.type === 'user_transcript') setTranscript(data.text);
          if (data.type === 'phase_complete') setPhase('PRACTICAL_SANDBOX');
        } else if (event.data instanceof Blob) {
          // Play AI Audio Response
          const audioUrl = URL.createObjectURL(event.data);
          const audio = new Audio(audioUrl);
          audio.play();
        }
      };

      ws.onclose = () => console.log("WebSocket disconnected");
      wsRef.current = ws;

      return () => {
        ws.close();
      };
    }
  }, [phase, sessionId]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(event.data);
        }
      };

      // Record in chunks of 500ms to stream via WebSocket
      mediaRecorder.start(500);
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("No se pudo acceder al micrófono.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const submitPractical = () => {
    // Aquí enviaríamos el código a evaluación
    alert("Código enviado para evaluación. Pasando a fase de sustentación (Defensa).");
    setPhase('CODE_DEFENSE');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Evaluación Integral</h1>
          <div className="text-sm text-slate-500 font-medium mt-1">Fase Actual: {phase.replace('_', ' ')}</div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full font-medium text-sm border border-green-200">
          <ShieldCheck size={18} /> Entorno Seguro Activo
        </div>
      </div>

      {fraudWarnings.length > 0 && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <div className="flex items-center gap-2 text-red-800 font-bold mb-2">
            <AlertTriangle size={20} />
            Se han detectado anomalías en tu sesión:
          </div>
          <ul className="list-disc pl-5 text-red-700 text-sm space-y-1">
            {fraudWarnings.map((warning, idx) => (
              <li key={idx}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* FASE 1 & FASE 3: VOZ */}
      {(phase === 'VOICE_INTERVIEW' || phase === 'CODE_DEFENSE') && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-slate-700 mb-2">
                {phase === 'VOICE_INTERVIEW' ? 'Entrevista Técnica con IA' : 'Sustentación de Solución (Defensa)'}
              </h2>
              <p className="text-slate-500">
                La IA ha iniciado la llamada. Presiona el micrófono para responder.
              </p>
            </div>

            <div className="flex flex-col items-center gap-6">
              {!isInterviewStarted ? (
                <button
                  onClick={() => setIsInterviewStarted(true)}
                  className="bg-brand-purple text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-brand-purple/90 shadow-lg hover:shadow-brand-purple/25"
                >
                  Iniciar Entrevista
                </button>
              ) : (
                <>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ${
                      isRecording 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse' 
                        : 'bg-brand-purple text-white hover:bg-brand-purple/90 shadow-lg hover:shadow-brand-purple/25'
                    }`}
                  >
                    {isRecording ? <Square size={32} /> : <Mic size={32} />}
                  </button>
                  <div className="font-medium text-slate-600">
                    {isRecording ? "Grabando (Stream activo)... (Haz clic para detener)" : "Haz clic para hablar"}
                  </div>
                </>
              )}
            </div>

            {(transcript || aiResponseText) && (
              <div className="mt-12 w-full grid grid-cols-2 gap-6 text-left">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <div className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Tú dijiste:</div>
                  <p className="text-slate-700">{transcript}</p>
                </div>
                <div className="bg-brand-purple/5 p-6 rounded-xl border border-brand-purple/10">
                  <div className="text-sm font-bold text-brand-purple mb-2 uppercase tracking-wider">IA (Aura) responde:</div>
                  <p className="text-slate-800">{aiResponseText}</p>
                </div>
              </div>
            )}
            
            {phase === 'VOICE_INTERVIEW' && (
              <button onClick={() => setPhase('PRACTICAL_SANDBOX')} className="mt-8 text-sm text-slate-400 underline">
                [Omitir a Fase 2 (Dev Only)]
              </button>
            )}
          </div>
        </div>
      )}

      {/* FASE 2: PRACTICA */}
      {phase === 'PRACTICAL_SANDBOX' && (
        <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-700 overflow-hidden text-white flex flex-col min-h-[600px]">
          <div className="p-4 bg-slate-800 flex justify-between items-center border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Code size={20} className="text-brand-teal" />
              <span className="font-semibold">Caso Práctico</span>
            </div>
            <button onClick={submitPractical} className="bg-brand-teal hover:bg-brand-teal/90 text-white px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5">
              <Play size={16} /> Enviar y Evaluar
            </button>
          </div>
          <div className="grid grid-cols-3 flex-1">
            <div className="col-span-1 border-r border-slate-700 p-6 bg-slate-800/50 text-sm overflow-y-auto">
              <h3 className="font-bold text-brand-teal mb-4 text-lg">Requerimiento</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                El cliente requiere un componente que renderice una lista de productos usando React y controle el estado de carga. 
              </p>
              <ul className="list-disc pl-5 text-slate-400 space-y-2">
                <li>Usa <code>useState</code> y <code>useEffect</code>.</li>
                <li>Simula una llamada a API de 2 segundos.</li>
                <li>Muestra un indicador de carga.</li>
              </ul>
            </div>
            <div className="col-span-2">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
