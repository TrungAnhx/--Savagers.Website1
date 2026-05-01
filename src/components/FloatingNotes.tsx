import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Note {
  id: number;
  text: string;
  top: string;
  duration: number;
}

export default function FloatingNotes({ notes }: { notes: string[] }) {
  const [activeNotes, setActiveNotes] = useState<Note[]>([]);
  const timeoutIdsRef = useRef<number[]>([]);

  useEffect(() => {
    if (notes.length === 0) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const spawnNote = () => {
      if (document.hidden) return;
      const text = notes[Math.floor(Math.random() * notes.length)];
      const top = `${Math.random() * 70 + 15}%`;
      const duration = Math.random() * 20 + 40;
      const newNote = { id: Date.now() + Math.random(), text, top, duration };

      setActiveNotes((prev) => [...prev, newNote]);

      const removeTimeout = window.setTimeout(() => {
        setActiveNotes((prev) => prev.filter((n) => n.id !== newNote.id));
      }, duration * 1000);
      timeoutIdsRef.current.push(removeTimeout);
    };

    spawnNote();
    const bootstrapTimeout = window.setTimeout(spawnNote, 10000);
    timeoutIdsRef.current.push(bootstrapTimeout);

    const interval = window.setInterval(() => {
      if (Math.random() > 0.4) spawnNote();
    }, 15000);

    return () => {
      clearInterval(interval);
      timeoutIdsRef.current.forEach((id) => clearTimeout(id));
      timeoutIdsRef.current = [];
    };
  }, [notes]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
      <AnimatePresence>
        {activeNotes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ left: '100vw', opacity: 0 }}
            animate={{ left: '-50vw', opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: note.duration, ease: 'linear' }}
            className="absolute whitespace-nowrap text-white/45 font-serif text-xl tracking-wide drop-shadow-lg"
            style={{ top: note.top, fontFamily: "'Instrument Serif', serif" }}
          >
            "{note.text}"
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
