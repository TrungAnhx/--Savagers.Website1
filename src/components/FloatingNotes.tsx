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
  const notesRef = useRef(notes);
  const timeoutIdsRef = useRef(new Set<number>());

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    const timeoutIds = timeoutIdsRef.current;

    const scheduleTimeout = (callback: () => void, delay: number) => {
      const timeoutId = window.setTimeout(() => {
        timeoutIds.delete(timeoutId);
        callback();
      }, delay);
      timeoutIds.add(timeoutId);
    };

    const spawnNote = () => {
      if (document.hidden) return;
      const availableNotes = notesRef.current;
      if (availableNotes.length === 0) return;
      const text = availableNotes[Math.floor(Math.random() * availableNotes.length)];
      const top = `${Math.random() * 70 + 15}%`;
      const duration = Math.random() * 20 + 40;
      const newNote = { id: Date.now() + Math.random(), text, top, duration };

      setActiveNotes((prev) => [...prev, newNote]);

      scheduleTimeout(() => {
        setActiveNotes((prev) => prev.filter((n) => n.id !== newNote.id));
      }, duration * 1000);
    };

    spawnNote();
    scheduleTimeout(spawnNote, 10000);

    const interval = window.setInterval(() => {
      if (Math.random() > 0.4) spawnNote();
    }, 15000);

    return () => {
      clearInterval(interval);
      timeoutIds.forEach((id) => clearTimeout(id));
      timeoutIds.clear();
    };
  }, []);

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
            style={{ top: note.top, fontFamily: "'Noto Serif Display', serif" }}
          >
            "{note.text}"
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
