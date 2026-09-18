"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Microscope, ScanLine } from "lucide-react";

const HOME_HERO_SLIDES = [
  {
    src: "/images/home-carousel/01-linh-chi.webp",
    alt: "Nấm linh chi đỏ trong buồng nghiên cứu sinh học tương lai",
    eyebrow: "Nấm dược liệu",
    title: "Linh Chi Đỏ",
  },
  {
    src: "/images/home-carousel/02-dong-trung-ha-thao.webp",
    alt: "Đông trùng hạ thảo trong hệ thống nuôi cấy tự động",
    eyebrow: "Nuôi cấy hoạt chất",
    title: "Đông Trùng Hạ Thảo",
  },
  {
    src: "/images/home-carousel/03-nam-hau-thu.webp",
    alt: "Nấm hầu thủ trong phòng nghiên cứu công nghệ cao",
    eyebrow: "Dinh dưỡng thần kinh",
    title: "Nấm Hầu Thủ",
  },
  {
    src: "/images/home-carousel/04-nam-thuc-pham.webp",
    alt: "Nấm hương, nấm sò và nấm kim châm trong hệ nuôi hữu cơ",
    eyebrow: "Nấm thực phẩm",
    title: "Hệ Nấm Hữu Cơ",
  },
  {
    src: "/images/home-carousel/05-thiet-bi-nuoi-cay.webp",
    alt: "Thiết bị nuôi cấy nấm thông minh trong phòng thí nghiệm",
    eyebrow: "Thiết bị & phôi",
    title: "Buồng Nuôi Cấy Thông Minh",
  },
] as const;

const AUTOPLAY_DELAY = 4_500;

function getCircularOffset(index: number, activeIndex: number) {
  const count = HOME_HERO_SLIDES.length;
  const offset = (index - activeIndex + count) % count;
  return offset > Math.floor(count / 2) ? offset - count : offset;
}

function getPanelStyle(offset: number): React.CSSProperties {
  if (offset === 0) {
    return {
      opacity: 1,
      transform: "translate3d(0, 0, 150px) rotateY(0deg) scale(1)",
      zIndex: 30,
      filter: "brightness(1) saturate(1.08)",
    };
  }

  const direction = offset < 0 ? -1 : 1;
  const distance = Math.abs(offset);

  if (distance === 1) {
    return {
      opacity: 0.72,
      transform: `translate3d(${direction * 68}%, 1%, 5px) rotateY(${direction * -48}deg) scale(0.82)`,
      zIndex: 20,
      filter: "brightness(0.62) saturate(0.78)",
    };
  }

  return {
    opacity: 0.24,
    transform: `translate3d(${direction * 105}%, 3%, -130px) rotateY(${direction * -66}deg) scale(0.58)`,
    zIndex: 10,
    filter: "brightness(0.4) saturate(0.55)",
  };
}

export function HomeHeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(query.matches);

    syncPreference();
    query.addEventListener("change", syncPreference);
    return () => query.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % HOME_HERO_SLIDES.length);
    }, AUTOPLAY_DELAY);

    return () => window.clearInterval(interval);
  }, []);

  const showPrevious = () => {
    setActiveIndex((current) => current === 0 ? HOME_HERO_SLIDES.length - 1 : current - 1);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % HOME_HERO_SLIDES.length);
  };

  const activeSlide = HOME_HERO_SLIDES[activeIndex];

  return (
    <section
      aria-label="Buồng trưng bày nấm xoay 360 độ"
      aria-roledescription="carousel"
      className="group relative h-full min-h-[28rem] overflow-hidden bg-[#020d18] [perspective:1400px] lg:min-h-[34rem]"
      data-active-slide={activeIndex + 1}
      data-slide-count={HOME_HERO_SLIDES.length}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") showPrevious();
        if (event.key === "ArrowRight") showNext();
      }}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(0,245,255,0.17),transparent_35%),linear-gradient(180deg,#031522_0%,#020b14_100%)]" />
      <div aria-hidden="true" className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(0,245,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,255,0.07)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]" />

      <div className="absolute inset-x-0 top-0 z-50 flex items-start justify-between gap-3 p-4 sm:p-6">
        <div className="inline-flex min-h-10 items-center gap-2 rounded-control border border-cyan-300/45 bg-[#03131f]/78 px-3 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-cyan-100 backdrop-blur-md sm:text-[10px]">
          <Microscope className="h-4 w-4 text-[#00f5ff]" aria-hidden="true" />
          Hệ sinh thái trực tiếp
        </div>
        <div className="flex items-center gap-2 rounded-control border border-cyan-300/35 bg-[#03131f]/80 px-3 py-2 font-mono text-[9px] tracking-[0.12em] text-cyan-100 backdrop-blur-md">
          <ScanLine className="h-3.5 w-3.5 text-[#00f5ff]" aria-hidden="true" />
          <span aria-label={`Ảnh ${activeIndex + 1} trên ${HOME_HERO_SLIDES.length}`}>
            {String(activeIndex + 1).padStart(2, "0")} / {String(HOME_HERO_SLIDES.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div aria-hidden="true" className="absolute left-1/2 top-[17%] z-10 h-[67%] w-[66%] -translate-x-1/2 rounded-[48%_48%_42%_42%/10%_10%_8%_8%] border-x border-cyan-200/30 bg-gradient-to-r from-cyan-100/[0.04] via-transparent to-cyan-100/[0.05] shadow-[inset_18px_0_34px_rgba(0,245,255,0.05),inset_-18px_0_34px_rgba(0,245,255,0.05),0_0_55px_rgba(0,217,255,0.09)]" />
      <div aria-hidden="true" className="absolute left-1/2 top-[13%] z-40 h-[13%] w-[82%] -translate-x-1/2 rounded-[50%] border-2 border-cyan-200/60 bg-gradient-to-b from-white/20 via-cyan-300/10 to-transparent shadow-[0_0_18px_rgba(0,245,255,0.75),0_10px_30px_rgba(0,0,0,0.75),inset_0_0_12px_rgba(255,255,255,0.22)]">
        <span className="absolute inset-[24%_7%] rounded-[50%] border border-cyan-100/50 shadow-[0_0_14px_rgba(0,245,255,0.65)]" />
      </div>
      <div aria-hidden="true" className="absolute bottom-[8%] left-1/2 z-40 h-[15%] w-[86%] -translate-x-1/2 rounded-[50%] border-2 border-cyan-200/65 bg-gradient-to-b from-cyan-300/5 via-slate-300/20 to-[#01101c]/90 shadow-[0_0_22px_rgba(0,245,255,0.72),0_18px_32px_rgba(0,0,0,0.78),inset_0_9px_18px_rgba(255,255,255,0.1)]">
        <span className="absolute inset-[18%_6%] rounded-[50%] border border-cyan-100/35" />
        <span className="absolute inset-x-[18%] bottom-[14%] h-px bg-gradient-to-r from-transparent via-[#00f5ff] to-transparent shadow-[0_0_10px_#00f5ff]" />
      </div>

      <div className="absolute inset-x-[4%] bottom-[15%] top-[20%] z-30 [perspective:1100px] [transform-style:preserve-3d] sm:inset-x-[6%]">
        {HOME_HERO_SLIDES.map((slide, index) => {
          const offset = getCircularOffset(index, activeIndex);
          const isActive = offset === 0;

          return (
            <div key={slide.src} aria-hidden={!isActive} className="pointer-events-none absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]">
              <article
                className={`relative h-[94%] w-[42%] min-w-[11rem] max-w-[20rem] overflow-hidden rounded-[46%_46%_18%_18%/7%_7%_5%_5%] border bg-[#02111d]/80 [backface-visibility:hidden] ${
                  isActive
                    ? "border-cyan-100/70 shadow-[0_0_32px_rgba(0,245,255,0.34),inset_0_0_24px_rgba(0,245,255,0.12)]"
                    : "border-cyan-300/30 shadow-[0_0_28px_rgba(0,245,255,0.12)]"
                } ${prefersReducedMotion ? "" : "will-change-[transform,opacity,filter] transition-[transform,opacity,filter] duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)]"}`}
                style={getPanelStyle(offset)}
              >
                <Image
                  fill
                  unoptimized
                  alt={slide.alt}
                  className="object-cover object-center"
                  fetchPriority={index === 0 ? "high" : "auto"}
                  loading="eager"
                  sizes="(min-width: 1024px) 26vw, 48vw"
                  src={slide.src}
                />
                <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(100deg,rgba(255,255,255,0.18),transparent_18%,transparent_72%,rgba(0,245,255,0.13)),linear-gradient(180deg,rgba(1,12,21,0.06),transparent_54%,rgba(1,12,21,0.72))]" />
                <div aria-hidden="true" className="absolute inset-x-[9%] top-3 h-px bg-gradient-to-r from-transparent via-cyan-100/85 to-transparent" />
                <div className="absolute inset-x-0 top-4 z-10 text-center font-mono text-[8px] font-bold uppercase tracking-[0.15em] text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] sm:text-[9px]">
                  <span className="mr-2 text-cyan-200/80">{String(index + 1).padStart(2, "0")}</span>
                  <span className={isActive ? "inline" : "hidden sm:inline"}>{slide.title}</span>
                </div>
              </article>
            </div>
          );
        })}
      </div>

      <button type="button" aria-label="Xoay buồng trưng bày sang trái" onClick={showPrevious} className="absolute left-[5%] top-1/2 z-50 inline-flex min-h-12 min-w-12 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-200/65 bg-[#03131f]/82 text-cyan-50 shadow-[0_0_18px_rgba(0,245,255,0.12)] backdrop-blur-md transition-all hover:border-[#00f5ff] hover:bg-[#00e7f0] hover:text-[#03101d] focus-visible:bio-focus motion-reduce:transition-none sm:left-[8%]">
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <button type="button" aria-label="Xoay buồng trưng bày sang phải" onClick={showNext} className="absolute right-[5%] top-1/2 z-50 inline-flex min-h-12 min-w-12 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-200/65 bg-[#03131f]/82 text-cyan-50 shadow-[0_0_18px_rgba(0,245,255,0.12)] backdrop-blur-md transition-all hover:border-[#00f5ff] hover:bg-[#00e7f0] hover:text-[#03101d] focus-visible:bio-focus motion-reduce:transition-none sm:right-[8%]">
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="absolute inset-x-0 bottom-[3%] z-50 flex flex-col items-center gap-1 px-4">
        <p className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[#00f5ff] sm:text-[9px]">{activeSlide.eyebrow}</p>
        <p className="max-w-[72%] truncate text-center font-heading text-sm font-bold text-white sm:text-base">{activeSlide.title}</p>
        <div className="mt-1 flex items-center gap-1 rounded-full border border-cyan-300/25 bg-[#03131f]/75 px-2 backdrop-blur-md" role="group" aria-label="Chọn mặt trưng bày">
          {HOME_HERO_SLIDES.map((slide, index) => (
            <button key={slide.src} type="button" aria-label={`Xem ${slide.title}`} aria-pressed={index === activeIndex} onClick={() => setActiveIndex(index)} className="inline-flex min-h-11 min-w-8 items-center justify-center rounded-full focus-visible:bio-focus">
              <span aria-hidden="true" className={`block h-1.5 rounded-full transition-[width,background-color] duration-500 motion-reduce:transition-none ${index === activeIndex ? "w-6 bg-[#00f5ff] shadow-[0_0_10px_rgba(0,245,255,0.9)]" : "w-1.5 bg-slate-500 hover:bg-cyan-200"}`} />
            </button>
          ))}
        </div>
      </div>

      <div aria-hidden="true" className="absolute left-1/2 top-[17%] z-50 h-[67%] w-[66%] -translate-x-1/2 overflow-hidden rounded-[48%_48%_42%_42%/10%_10%_8%_8%] border border-cyan-100/15">
        <span className="absolute -left-[12%] top-0 h-full w-[28%] rotate-[7deg] bg-gradient-to-r from-transparent via-white/[0.09] to-transparent blur-sm" />
        <span className="absolute right-[5%] top-0 h-full w-px bg-gradient-to-b from-transparent via-cyan-100/45 to-transparent" />
      </div>
    </section>
  );
}
