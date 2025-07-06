import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

type Slide = {
  id: string;
  image: string;
  children: React.ReactNode;
};

type HeroSliderProps = {
  slides?: Slide[];
  autoPlayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  showProgress?: boolean;
};

const TRANSITION_DURATION = 500;
const SWIPE_RESISTANCE = 2;

const defaultSlides: Slide[] = [
  {
    id: "1",
    image:
      "https://avante.pro/upload/iblock/8f8/8f88dda6ea3f26d9fb12d41946a468e7.jpg",
    children: (
      <>
        <div className="flex flex-col gap-y-6 items-center">
          <h2 className="text-xl lg:text-4xl text-center font-semibold">
            Полный цикл работ по устройству современных инженерных систем любой
            сложности
          </h2>
          <ul className="list-image-[url('/checkmark.svg')] list-inside text-sm hidden sm:block">
            <li>
              системы вентиляции, дымоудаления, отопления и кондиционирования
            </li>
            <li>разработка проекта от 1 дня </li>
            <li>поставка и монтаж оборудования от 1 недели</li>
          </ul>
          <div className="flex flex-wrap justify-around gap-2">
            <Button className="text-white hover:bg-green-500 font-medium px-6 h-10">
              Направления
            </Button>
            <Button variant="outline" className="font-medium px-6 h-10">
              Задать вопрос
            </Button>
          </div>
        </div>
      </>
    ),
  },
  {
    id: "2",
    image: "https://avante.pro/upload/iblock/cf7/1_3.jpg",
    children: (
      <>
        <div className="hidden lg:block">
          <img
            className="w-full h-auto"
            src="https://avante.pro/upload/iblock/c66/23.png"
          />
        </div>
        <div className="mx-auto">
          <div className="text-2xl lg:text-4xl font-semibold text-center">
            Доставка БЕСПЛАТНО
            <br />
            при заказе от 300 тыс. рублей
          </div>
        </div>
      </>
    ),
  },
  {
    id: "3",
    image:
      "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80",
    children: (
      <>
        <div className="flex flex-col gap-y-6">
          <h2 className="text-xl lg:text-2xl font-semibold">
            Полный цикл работ по устройству современных инженерных систем любой
            сложности
          </h2>
          <ul className="list-image-[url('/checkmark.svg')] list-inside">
            <li>
              системы вентиляции, дымоудаления, отопления и кондиционирования
            </li>
            <li>разработка проекта от 1 дня </li>
            <li>поставка и монтаж оборудования от 1 недели</li>
          </ul>
          <div className="flex gap-2">
            <Button className="text-white hover:bg-green-500 font-medium px-6 h-10">
              Направления
            </Button>
            <Button variant="outline" className="font-medium px-6 h-10">
              Задать вопрос
            </Button>
          </div>
        </div>
      </>
    ),
  },
];

export const HeroSlider = ({
  slides = defaultSlides,
  autoPlayInterval = 5000,
  showArrows = true,
  showDots = true,
}: HeroSliderProps) => {
  const [currentIndex, setCurrentIndex] = React.useState(1);
  const currentIndexRef = React.useRef(currentIndex);
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(true);
  const [isSliding, setIsSliding] = React.useState(false);

  const [isSwiping, setIsSwiping] = React.useState(false);
  const [touchStart, setTouchStart] = React.useState(0);
  const [swipeDistance, setSwipeDistance] = React.useState(0);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const timerRef = React.useRef<NodeJS.Timeout>();
  const sliderRef = React.useRef<HTMLDivElement>(null);

  const clonedSlides = React.useMemo(() => {
    if (slides.length === 0) return [];

    return [slides[slides.length - 1], ...slides, slides[0]];
  }, [slides]);
  const totalSlides = clonedSlides.length;
  const currentSlide = React.useMemo(() => {
    if (currentIndex === 0) return slides.length - 1;
    if (currentIndex === totalSlides - 1) return 0;
    return currentIndex - 1;
  }, [currentIndex, totalSlides, slides.length]);

  const goToSlide = (index: number) => {
    if (
      isSliding ||
      index === currentIndex ||
      index < 0 ||
      index >= totalSlides
    )
      return;
    setCurrentIndex(index);
  };

  const goToNextSlide = () => {
    if (isSliding) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const goToPrevSlide = () => {
    if (isSliding) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsAutoPlaying(false);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
    setSwipeDistance(0);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isSwiping) return;

    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;

    if (
      (currentIndex === 0 && diff > 0) ||
      (currentIndex === totalSlides - 1 && diff < 0)
    ) {
      setSwipeDistance(diff / SWIPE_RESISTANCE);
    } else {
      setSwipeDistance(diff);
    }
  };

  const handleTouchEnd = () => {
    const containerWidth = containerRef.current?.clientWidth || 0;
    const distanceThreshold = containerWidth * 0.3;
    const shouldChange = Math.abs(swipeDistance) > distanceThreshold;

    if (shouldChange) {
      setIsSwiping(false);
      if (swipeDistance > 0) {
        setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
      } else {
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
      }
    } else {
      setSwipeDistance(0);
      setTimeout(() => setIsSwiping(false), TRANSITION_DURATION);
    }
    setTimeout(() => setIsAutoPlaying(true), TRANSITION_DURATION);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
      if (e.key === "ArrowLeft") goToPrevSlide();
      if (e.key === "ArrowRight") goToNextSlide();
      if (e.key === " ") toggleAutoPlay();
    };

    window.addEventListener("keydown", handleKeyDown);

    const handleTransitionEnd = function (e: TransitionEvent) {
      setIsSliding(false);
      const slider = e.currentTarget as HTMLElement;

      if (currentIndexRef.current === 0) {
        slider.style.transitionDuration = "0ms";
        setCurrentIndex(totalSlides - 2);
      } else if (currentIndexRef.current === totalSlides - 1) {
        slider.style.transitionDuration = "0ms";
        setCurrentIndex(1);
      }

      setTimeout(() => {
        slider.style.transitionDuration = `${TRANSITION_DURATION}ms`;
      }, 10);
    };

    const handleTransitionStart = () => {
      setIsSliding(true);
    };

    if (sliderRef.current) {
      sliderRef.current.addEventListener("transitionend", handleTransitionEnd);
      sliderRef.current.addEventListener(
        "transitionstart",
        handleTransitionStart
      );
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (sliderRef.current) {
        sliderRef.current.removeEventListener(
          "transitionend",
          handleTransitionEnd
        );
        sliderRef.current.removeEventListener(
          "transitionstart",
          handleTransitionStart
        );
      }
    };
  }, []);

  React.useEffect(() => {
    currentIndexRef.current = currentIndex;
    // Clear any existing timer first
    if (timerRef.current) clearTimeout(timerRef.current);

    // Only start timer if autoplay is enabled
    if (isAutoPlaying) {
      timerRef.current = setTimeout(goToNextSlide, autoPlayInterval);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, isAutoPlaying, autoPlayInterval]); // Add dependencies

  return (
    <div
      ref={containerRef}
      className="relative w-full h-96 lg:h-[500px] overflow-hidden group border-b touch-pan-y"
      role="region"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Slides Container */}
      <div
        className="flex h-full will-change-transform transition-transform"
        style={{
          transform: isSwiping
            ? `translateX(calc(-${currentIndex * 100}% + ${swipeDistance}px))`
            : `translateX(-${currentIndex * 100}%)`,
          transitionDuration: `500ms`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="group"
        ref={sliderRef}
      >
        {clonedSlides.map((slide, index) => (
          <SlideContent
            key={index}
            slide={slide}
            isActive={currentIndex === index}
          />
        ))}
      </div>

      {/* Control Overlay - Fixed position elements */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block px-4 xl:px-0">
        <div className="container mx-auto h-full relative">
          {/* Navigation Arrows */}
          {showArrows && totalSlides > 1 && (
            <NavigationArrows onPrev={goToPrevSlide} onNext={goToNextSlide} />
          )}
        </div>
      </div>

      {/* Dots Navigation - Fixed bottom center */}
      {showDots && slides.length > 1 && (
        <DotsNavigation
          total={slides.length}
          current={currentSlide}
          onDotClick={(index) => goToSlide(index + 1)}
        />
      )}
    </div>
  );
};

// Sub-components with improved styling

const SlideContent = ({
  slide,
  isActive,
}: {
  slide: Slide;
  isActive: boolean;
}) => {
  return (
    <div
      className="relative flex-shrink-0 w-full h-full"
      role="group"
      aria-roledescription="slide"
      aria-label={`Slide ${slide.id}`}
      aria-hidden={!isActive}
    >
      {/* Background Image with Improved Treatment */}

      <div className="absolute inset-0 overflow-hidden">
        <img
          src={slide.image}
          alt=""
          className="object-cover w-full h-full"
          loading={isActive ? "eager" : "lazy"}
        />
      </div>

      <div className="absolute inset-0 bg-black/5 backdrop-blur-sm lg:hidden" />

      <div className="relative z-10 container mx-auto grid grid-cols-1 lg:grid-cols-2 items-center h-full sm:!px-12">
        {slide.children}
      </div>
    </div>
  );
};

const NavigationArrows = ({
  onPrev,
  onNext,
}: {
  onPrev: () => void;
  onNext: () => void;
}) => (
  <>
    <button
      onClick={onPrev}
      className="absolute shadow-md left-0 top-1/2 -translate-y-1/2 z-40 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 opacity-0 group-hover:opacity-100 -translate-x-8 group-hover:translate-x-0 active:outline-none transition-all duration-200 p-2 pointer-events-auto"
      aria-label="Previous slide"
    >
      <ChevronLeft className="size-5 text-white mr-0.5" />
    </button>
    <button
      onClick={onNext}
      className="absolute shadow-md right-0 top-1/2 -translate-y-1/2 z-40 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 opacity-0 group-hover:opacity-100 translate-x-8 group-hover:translate-x-0 active:outline-none transition-all duration-200 p-2 pointer-events-auto"
      aria-label="Next slide"
    >
      <ChevronRight className="size-5 text-white ml-0.5" />
    </button>
  </>
);

const DotsNavigation = ({
  total,
  current,
  onDotClick,
}: {
  total: number;
  current: number;
  onDotClick: (index: number) => void;
}) => (
  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-2">
    {Array.from({ length: total }).map((_, index) => (
      <button
        key={index}
        onClick={() => onDotClick(index)}
        className={`h-2 rounded-full transition-all duration-300 active:outline-none ${
          current === index
            ? "bg-black w-8"
            : "bg-black/40 w-2 hover:bg-black/60"
        }`}
        aria-label={`Go to slide ${index + 1}`}
        aria-current={current === index}
      />
    ))}
  </div>
);
