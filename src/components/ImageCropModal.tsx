import { useEffect, useRef, useState, useCallback } from 'react';

interface Props {
  src: string;
  shape?: 'circle' | 'square';
  outputSize?: number;
  onConfirm: (croppedDataUrl: string) => void;
  onClose: () => void;
}

const CROP_SIZE = 280;

export default function ImageCropModal({ src, shape = 'circle', outputSize = 400, onConfirm, onClose }: Props) {
  const imgRef       = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [loaded,   setLoaded]   = useState(false);
  const [zoom,     setZoom]     = useState(1);
  const [offset,   setOffset]   = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const minZoom = useRef(1);
  const zoomRef   = useRef(zoom);
  const offsetRef = useRef(offset);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { offsetRef.current = offset; }, [offset]);

  // Initialise zoom/offset once image loads
  function handleLoad() {
    const img = imgRef.current!;
    const { naturalWidth: nw, naturalHeight: nh } = img;
    // fit the shorter side to CROP_SIZE
    const fitZoom = Math.max(CROP_SIZE / nw, CROP_SIZE / nh);
    minZoom.current = fitZoom;
    const z = fitZoom;
    setZoom(z);
    setOffset({
      x: (CROP_SIZE - nw * z) / 2,
      y: (CROP_SIZE - nh * z) / 2,
    });
    setLoaded(true);
  }

  // Clamp offset so the image always covers the crop area
  const clamp = useCallback((ox: number, oy: number, z: number) => {
    const img = imgRef.current;
    if (!img) return { x: ox, y: oy };
    const iw = img.naturalWidth  * z;
    const ih = img.naturalHeight * z;
    return {
      x: Math.min(0, Math.max(CROP_SIZE - iw, ox)),
      y: Math.min(0, Math.max(CROP_SIZE - ih, oy)),
    };
  }, []);

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    setDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  }
  function onTouchStart(e: React.TouchEvent) {
    setDragging(true);
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }

  useEffect(() => {
    function move(cx: number, cy: number) {
      if (!dragging) return;
      const dx = cx - lastPos.current.x;
      const dy = cy - lastPos.current.y;
      lastPos.current = { x: cx, y: cy };
      setOffset(prev => clamp(prev.x + dx, prev.y + dy, zoom));
    }
    const mm = (e: MouseEvent)  => move(e.clientX, e.clientY);
    const mt = (e: TouchEvent)  => move(e.touches[0].clientX, e.touches[0].clientY);
    const up = () => setDragging(false);
    window.addEventListener('mousemove', mm);
    window.addEventListener('mouseup',   up);
    window.addEventListener('touchmove', mt, { passive: true });
    window.addEventListener('touchend',  up);
    return () => {
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mouseup',   up);
      window.removeEventListener('touchmove', mt);
      window.removeEventListener('touchend',  up);
    };
  }, [dragging, zoom, clamp]);

  // Non-passive wheel listener so e.preventDefault() actually works
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const z  = zoomRef.current;
      const ox = offsetRef.current.x;
      const oy = offsetRef.current.y;
      const delta = -e.deltaY * 0.001;
      const newZ  = Math.max(minZoom.current, Math.min(4, z + delta * z));
      const scale = newZ / z;
      const cx    = CROP_SIZE / 2;
      const cy    = CROP_SIZE / 2;
      setZoom(newZ);
      setOffset(clamp(cx - scale * (cx - ox), cy - scale * (cy - oy), newZ));
    }
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [clamp]);

  function handleZoomSlider(v: number) {
    const newZ  = v;
    const scale = newZ / zoom;
    const cx    = CROP_SIZE / 2;
    const cy    = CROP_SIZE / 2;
    const newOx = cx - scale * (cx - offset.x);
    const newOy = cy - scale * (cy - offset.y);
    setZoom(newZ);
    setOffset(clamp(newOx, newOy, newZ));
  }

  function handleConfirm() {
    const img = imgRef.current!;
    const canvas  = document.createElement('canvas');
    canvas.width  = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d')!;

    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    // Source rect in natural image coords
    const sx = -offset.x / zoom;
    const sy = -offset.y / zoom;
    const sw = CROP_SIZE / zoom;
    const sh = CROP_SIZE / zoom;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outputSize, outputSize);

    onConfirm(canvas.toDataURL('image/jpeg', 0.92));
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-card-dark"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">Ajustar foto</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="p-5 flex flex-col items-center gap-5">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Arrastra para posicionar · usa la rueda del mouse o el slider para hacer zoom
          </p>

          {/* Crop area */}
          <div
            ref={containerRef}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            style={{ width: CROP_SIZE, height: CROP_SIZE, cursor: dragging ? 'grabbing' : 'grab' }}
            className="relative overflow-hidden bg-slate-900 select-none"
          >
            {/* Image */}
            <img
              ref={imgRef}
              src={src}
              alt=""
              onLoad={handleLoad}
              draggable={false}
              style={{
                position: 'absolute',
                width:  imgRef.current ? imgRef.current.naturalWidth  * zoom : 0,
                height: imgRef.current ? imgRef.current.naturalHeight * zoom : 0,
                left: offset.x,
                top:  offset.y,
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />

            {/* Grid overlay */}
            {loaded && (
              <div className="pointer-events-none absolute inset-0" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px)',
                backgroundSize: `${CROP_SIZE/3}px ${CROP_SIZE/3}px`,
              }} />
            )}

            {/* Circle / square mask — darkens outside */}
            {shape === 'circle' ? (
              <div className="pointer-events-none absolute inset-0" style={{
                boxShadow: `0 0 0 ${CROP_SIZE}px rgba(0,0,0,0.55)`,
                borderRadius: '50%',
                left: 0, top: 0,
                width: '100%', height: '100%',
              }} />
            ) : (
              <div className="pointer-events-none absolute inset-0 ring-4 ring-inset ring-white/30" />
            )}
          </div>

          {/* Zoom slider */}
          {loaded && (
            <div className="flex w-full items-center gap-3">
              <span className="material-symbols-outlined text-base text-slate-400">zoom_out</span>
              <input
                type="range"
                min={minZoom.current}
                max={Math.max(minZoom.current * 4, 4)}
                step={0.01}
                value={zoom}
                onChange={e => handleZoomSlider(parseFloat(e.target.value))}
                className="flex-1 accent-brand-600"
              />
              <span className="material-symbols-outlined text-base text-slate-400">zoom_in</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex w-full gap-3">
            <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button onClick={handleConfirm} disabled={!loaded} className="btn-primary flex-1 justify-center disabled:opacity-50">
              <span className="material-symbols-outlined text-base">check</span>
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
