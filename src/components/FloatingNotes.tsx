import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Note {
  id: number;
  text: string;
  top: string;
  duration: number;
}

export default function FloatingNotes({ notes }: { notes: string[] }) {
  const [activeNotes, setActiveNotes] = useState<Note[]>([]);

  useEffect(() => {
    if (notes.length === 0) return;

    const spawnNote = () => {
      const text = notes[Math.floor(Math.random() * notes.length)];
      const top = `${Math.random() * 70 + 15}%`; // Tránh dính quá sát 2 mép (15% - 85%)
      const duration = Math.random() * 20 + 40; // Trôi siêu chậm (40-60 giây)
      const newNote = { id: Date.now() + Math.random(), text, top, duration };
      
      setActiveNotes(prev => [...prev, newNote]);

      setTimeout(() => {
        setActiveNotes(prev => prev.filter(n => n.id !== newNote.id));
      }, duration * 1000);
    };

    // Khởi tạo vài dòng chữ bay ngay lúc đầu
    spawnNote();
    setTimeout(spawnNote, 10000);
    
    // Liên tục sinh ra dòng tâm sự mới
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        spawnNote();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [notes]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden mix-blend-screen">
      <AnimatePresence>
        {activeNotes.map(note => (
          <motion.div
            key={note.id}
            initial={{ left: '100vw', opacity: 0 }}
            animate={{ left: '-50vw', opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: note.duration, ease: 'linear' }}
            className="absolute whitespace-nowrap text-white/30 font-serif text-xl tracking-wide drop-shadow-lg"
            style={{ top: note.top, fontFamily: "'Lora', serif" }}
          >
            "{note.text}"
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
