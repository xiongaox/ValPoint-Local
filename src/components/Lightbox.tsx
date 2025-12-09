// @ts-nocheck
import React, { useMemo } from 'react';
import Icon from './Icon';

const Lightbox = ({ viewingImage, setViewingImage }) => {
  if (!viewingImage) return null;

  const { src, list, index } = useMemo(() => {
    if (typeof viewingImage === 'string') {
      return { src: viewingImage, list: [], index: 0 };
    }
    return {
      src: viewingImage?.src,
      list: Array.isArray(viewingImage?.list) ? viewingImage.list.filter(Boolean) : [],
      index: typeof viewingImage?.index === 'number' ? viewingImage.index : 0,
    };
  }, [viewingImage]);

  const hasList = list && list.length > 1;
  const currentIndex = hasList ? Math.min(Math.max(index, 0), list.length - 1) : 0;

  const goPrev = (e) => {
    e.stopPropagation();
    if (!hasList) return;
    const nextIndex = (currentIndex - 1 + list.length) % list.length;
    setViewingImage({ src: list[nextIndex], list, index: nextIndex });
  };

  const goNext = (e) => {
    e.stopPropagation();
    if (!hasList) return;
    const nextIndex = (currentIndex + 1) % list.length;
    setViewingImage({ src: list[nextIndex], list, index: nextIndex });
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setViewingImage(null)}>
      <div className="relative max-w-6xl w-full flex flex-col items-center gap-4">
        <img src={src} className="lightbox-img rounded max-h-[80vh]" onClick={(e) => e.stopPropagation()} />

        {hasList && (
          <div
            className="flex items-center gap-3 px-4 py-2 rounded-full bg-black/70 backdrop-blur-md border border-white/15"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#ff4655] text-white transition-colors border border-white/15"
              onClick={goPrev}
            >
              <Icon name="ChevronLeft" size={22} />
            </button>
            <div className="flex items-center gap-2">
              {list.map((thumbSrc, idx) => (
                <button
                  key={thumbSrc + idx}
                  className={`w-16 h-10 rounded overflow-hidden border ${idx === currentIndex ? 'border-[#ff4655]' : 'border-white/15'} bg-black/40 hover:border-[#ff4655] transition-colors`}
                  onClick={() => setViewingImage({ src: thumbSrc, list, index: idx })}
                >
                  <img src={thumbSrc} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#ff4655] text-white transition-colors border border-white/15"
              onClick={goNext}
            >
              <Icon name="ChevronRight" size={22} />
            </button>
          </div>
        )}
      </div>

      <button
        className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-black/60 hover:bg-[#ff4655] rounded-full text-white transition-all backdrop-blur-md border border-white/20"
        onClick={(e) => {
          e.stopPropagation();
          setViewingImage(null);
        }}
      >
        <Icon name="X" size={28} />
      </button>
    </div>
  );
};

export default Lightbox;
