import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AmbientVideo from '../components/AmbientVideo';

const backgroundVideos = [
  '/backgrounds/bg1.mp4',
  '/backgrounds/bg2.mp4',
  '/backgrounds/bg3.mp4',
  '/backgrounds/bg4.mp4',
  '/backgrounds/bg5.mp4'
];

interface AboutProps {
  onAddNote: (note: string) => void;
  isZenMode?: boolean;
}

const brotherhoodPillars = [
  {
    title: '5 người, một hướng đi',
    body: 'Savagers là một nhóm gồm 5 anh em cùng đi trên con đường phát triển bản thân, sự nghiệp và tư duy sống. Mỗi người có một thế mạnh riêng, nhưng cùng giữ chung tinh thần học hỏi, làm việc nghiêm túc và không ngừng nâng cấp chính mình.'
  },
  {
    title: 'Hình thành từ nhu cầu thật',
    body: 'Trang web này ra đời từ một nhu cầu rất thực: cần một nơi đủ yên để đọc, nghe, suy nghĩ và giữ nhịp giữa quá nhiều nhiễu động trên internet. Nó bắt đầu từ những thứ bọn mình dùng mỗi ngày, rồi dần trở thành một không gian chung.'
  },
  {
    title: 'Điều web này muốn mang lại',
    body: 'Savagers không cố giữ người dùng bằng feed vô tận hay những cú kéo chú ý. Nó muốn mang lại một nhịp chậm hơn, một góc nhìn sâu hơn và một trạng thái tỉnh hơn để quay lại với công việc, cuộc sống và hành trình dài của mỗi người.'
  }
];

export default function About({ onAddNote, isZenMode }: AboutProps) {
  const [note, setNote] = useState('');
  const [bgIndex, setBgIndex] = useState(() => Math.floor(Math.random() * backgroundVideos.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundVideos.length);
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  const currentBg = backgroundVideos[bgIndex];

  return (
    <div className="relative min-h-screen w-full flex flex-col pt-32 pb-40 px-6 z-10">
      <div className="fixed inset-0 bg-background z-[-2]"></div>

      <AmbientVideo
        src={currentBg}
        className="fixed inset-0 w-full h-full object-cover z-[-1] opacity-60"
        opacityClassName="fixed inset-0 bg-gradient-to-b from-background/90 via-background/40 to-background/90 z-[-1] pointer-events-none"
      />

      <div className={`max-w-5xl mx-auto w-full relative transition-opacity duration-1000 ${isZenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="animate-[fade-rise_0.6s_ease-out]">
          <header className="mb-24 text-center">
            <span className="text-primary tracking-[0.28em] uppercase text-sm font-mono mb-4 block">About Savagers</span>
            <h1 className="text-6xl md:text-8xl text-foreground mb-8" style={{ fontFamily: "'Noto Serif Display', serif" }}>
              Savagers.
            </h1>
            <p className="text-muted-foreground text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto">
              Một góc yên tĩnh được dựng lên bởi 5 anh em cùng đi trên con đường phát triển bản thân, sự nghiệp và chiều sâu nội tâm mà không phải sống trong ồn ào.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] gap-16 md:gap-20 items-start mb-28">
            <div className="space-y-7 text-lg text-muted-foreground leading-relaxed">
              <p>
                Savagers bắt đầu không phải như một dự án truyền thông, mà như một lời nhắc giữa những người cùng chí hướng: phải xây được một nền sống tử tế, có hướng đi rõ ràng, có năng lực làm việc và có khả năng tự đứng vững trước những giai đoạn khó khăn.
              </p>
              <p>
                Nhóm có 5 thành viên nam. Mỗi người mang vào đây một phần chất riêng: người nghiêng về công nghệ, người quan sát cuộc sống, người giữ nhịp kỷ luật, người thích đào sâu tư duy, người yêu âm nhạc và cảm xúc. Savagers vì thế không nói bằng một giọng duy nhất, mà bằng một tinh thần chung.
              </p>
              <p>
                Trang web này được hình thành để gom lại những thứ bọn mình thật sự dùng mỗi ngày: nhạc để giữ nhịp, bài viết để mở góc nhìn, và một không gian có chủ đích để tránh bị cuốn vào tốc độ hỗn loạn của internet. Nó không phải nơi để gây nghiện. Nó là nơi để bạn lấy lại trục của mình.
              </p>
            </div>

            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden liquid-glass border border-white/5 group">
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2940&auto=format&fit=crop"
                alt="Night workspace with quiet focus"
                className="absolute inset-0 h-full w-full object-cover opacity-65 group-hover:scale-105 transition-transform duration-[2200ms]"
              />
              <div className="absolute bottom-8 left-8 right-8 z-20">
                <p className="text-foreground text-2xl font-serif leading-tight">
                  Một nhóm nhỏ.
                  <br />
                  Một nhịp sống có chủ đích.
                </p>
              </div>
            </div>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-28">
            {brotherhoodPillars.map((pillar) => (
              <article key={pillar.title} className="liquid-glass border border-white/10 rounded-2xl p-7 min-h-[240px]">
                <h2 className="text-2xl text-foreground mb-4" style={{ fontFamily: "'Noto Serif Display', serif" }}>
                  {pillar.title}
                </h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  {pillar.body}
                </p>
              </article>
            ))}
          </section>

          <section className="mb-28 grid grid-cols-1 md:grid-cols-2 gap-14 items-start">
            <div className="space-y-6">
              <h2 className="text-4xl text-foreground" style={{ fontFamily: "'Noto Serif Display', serif" }}>
                Web này mang lại gì?
              </h2>
              <p className="text-muted-foreground leading-8 text-lg">
                Trước hết là một nhịp chậm hơn. Bạn có thể mở một track, đọc một bài viết, hoặc chỉ đơn giản ngồi lại vài phút mà không bị dội vào mặt bởi hàng chục lời kêu gọi chú ý.
              </p>
              <p className="text-muted-foreground leading-8 text-lg">
                Sau đó là chiều sâu. Nội dung ở đây xoay quanh những mảng mà bọn mình thực sự quan tâm và cũng thực sự sống cùng nó: AI, công nghệ, nghề nghiệp, quan điểm sống, và hành trình tự nâng cấp bản thân.
              </p>
              <p className="text-muted-foreground leading-8 text-lg">
                Cuối cùng là cảm giác đồng hành. Savagers không dạy đời ai cả. Nó chỉ tạo ra một nơi để người đọc thấy mình không phải đi một mình trên con đường làm người cho ra người và làm việc cho ra việc.
              </p>
            </div>

            <div className="liquid-glass border border-white/10 rounded-3xl p-8">
              <h3 className="text-2xl text-foreground mb-5" style={{ fontFamily: "'Noto Serif Display', serif" }}>
                Leave a whisper
              </h3>
              <p className="text-sm text-muted-foreground leading-7 mb-6">
                Nếu nơi này đã từng giúp bạn bình tâm hơn một chút, để lại một dòng ngắn. Nó sẽ trôi qua màn hình như một phần của bầu không khí chung.
              </p>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Viết tâm sự của bạn vào đây..."
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none border-b border-white/10 pb-4 mb-5"
              />
              <button
                onClick={() => {
                  if (note.trim()) {
                    onAddNote(note);
                    setNote('');
                  }
                }}
                className="w-full py-3 bg-foreground text-background rounded-full hover:bg-white transition-colors text-sm font-medium"
              >
                Gửi tâm sự
              </button>
            </div>
          </section>

          <div className="text-center mt-20">
            <p className="text-muted-foreground mb-8 text-lg">Nếu đã vào đây, thì đừng vội. Nghe một track trước đã.</p>
            <Link to="/mixtapes" className="liquid-glass rounded-full px-10 py-4 text-sm text-foreground hover:scale-[1.03] transition-transform inline-flex items-center gap-3">
              Enter The Frequencies <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
