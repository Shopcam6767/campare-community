"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import ProductThumb, { isRealImage } from "@/components/product-thumb";

interface ProductImageZoomProps {
  src: string | null | undefined;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

export default function ProductImageZoom({
  src,
  alt,
  priority = false,
  className = "",
  sizes = "(max-width: 1024px) 100vw, 55vw",
}: ProductImageZoomProps) {
  const isReal = isRealImage(src);

  // State สำหรับ Inline View
  const [inlineScale, setInlineScale] = useState(1);
  const [inlinePos, setInlinePos] = useState({ x: 0, y: 0 });
  const [isInlineDragging, setIsInlineDragging] = useState(false);
  const inlineDragStart = useRef({ x: 0, y: 0 });
  const inlinePosStart = useRef({ x: 0, y: 0 });

  // State สำหรับ Fullscreen Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalScale, setModalScale] = useState(1);
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });
  const [isModalDragging, setIsModalDragging] = useState(false);
  const modalDragStart = useRef({ x: 0, y: 0 });
  const modalPosStart = useRef({ x: 0, y: 0 });

  // Pinch-to-zoom state สำหรับ touch devices
  const initialTouchDistance = useRef<number | null>(null);
  const initialTouchScale = useRef(1);

  // ขอบเขตการซูม
  const MIN_SCALE = 1;
  const MAX_SCALE = 4;
  const STEP = 0.5;

  // ฟังก์ชันปรับสเกล Inline
  const handleInlineZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setInlineScale((prev) => Math.min(MAX_SCALE, Number((prev + STEP).toFixed(1))));
  };

  const handleInlineZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setInlineScale((prev) => {
      const next = Math.max(MIN_SCALE, Number((prev - STEP).toFixed(1)));
      if (next === 1) setInlinePos({ x: 0, y: 0 });
      return next;
    });
  };

  const handleInlineReset = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setInlineScale(1);
    setInlinePos({ x: 0, y: 0 });
  };

  // ฟังก์ชันปรับสเกล Modal
  const handleModalZoomIn = useCallback(() => {
    setModalScale((prev) => Math.min(MAX_SCALE, Number((prev + STEP).toFixed(1))));
  }, []);

  const handleModalZoomOut = useCallback(() => {
    setModalScale((prev) => {
      const next = Math.max(MIN_SCALE, Number((prev - STEP).toFixed(1)));
      if (next === 1) setModalPos({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleModalReset = useCallback(() => {
    setModalScale(1);
    setModalPos({ x: 0, y: 0 });
  }, []);

  const handleModalSetScale = useCallback((scale: number) => {
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
    setModalScale(clamped);
    if (clamped === 1) setModalPos({ x: 0, y: 0 });
  }, []);

  // เปิด-ปิด Modal
  const openModal = () => {
    if (!isReal) return;
    setModalScale(1);
    setModalPos({ x: 0, y: 0 });
    setIsModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalScale(1);
    setModalPos({ x: 0, y: 0 });
  }, []);

  // ดับเบิลคลิกเพื่อสลับ 1x <-> 2.5x
  const handleInlineDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inlineScale > 1) {
      handleInlineReset();
    } else {
      setInlineScale(2.5);
    }
  };

  const handleModalDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (modalScale > 1) {
      handleModalReset();
    } else {
      setModalScale(2.5);
    }
  };

  // Inline Drag Handlers
  const handleInlineMouseDown = (e: React.MouseEvent) => {
    if (inlineScale <= 1) return;
    e.preventDefault();
    setIsInlineDragging(true);
    inlineDragStart.current = { x: e.clientX, y: e.clientY };
    inlinePosStart.current = { ...inlinePos };
  };

  const handleInlineMouseMove = (e: React.MouseEvent) => {
    if (!isInlineDragging || inlineScale <= 1) return;
    const dx = e.clientX - inlineDragStart.current.x;
    const dy = e.clientY - inlineDragStart.current.y;
    const maxOffset = (inlineScale - 1) * 200;
    setInlinePos({
      x: Math.min(maxOffset, Math.max(-maxOffset, inlinePosStart.current.x + dx)),
      y: Math.min(maxOffset, Math.max(-maxOffset, inlinePosStart.current.y + dy)),
    });
  };

  const handleInlineMouseUp = () => {
    setIsInlineDragging(false);
  };

  // Modal Drag Handlers
  const handleModalMouseDown = (e: React.MouseEvent) => {
    if (modalScale <= 1) return;
    e.preventDefault();
    setIsModalDragging(true);
    modalDragStart.current = { x: e.clientX, y: e.clientY };
    modalPosStart.current = { ...modalPos };
  };

  const handleModalMouseMove = (e: React.MouseEvent) => {
    if (!isModalDragging || modalScale <= 1) return;
    const dx = e.clientX - modalDragStart.current.x;
    const dy = e.clientY - modalDragStart.current.y;
    const maxOffset = (modalScale - 1) * 450;
    setModalPos({
      x: Math.min(maxOffset, Math.max(-maxOffset, modalPosStart.current.x + dx)),
      y: Math.min(maxOffset, Math.max(-maxOffset, modalPosStart.current.y + dy)),
    });
  };

  const handleModalMouseUp = () => {
    setIsModalDragging(false);
  };

  // Modal Wheel Zoom
  const handleModalWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setModalScale((prev) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number((prev + delta).toFixed(2))));
      if (next === 1) setModalPos({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // Touch handlers สำหรับ Modal
  const getTouchDistance = (e: React.TouchEvent) => {
    if (e.touches.length < 2) return 0;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.hypot(dx, dy);
  };

  const handleModalTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      initialTouchDistance.current = getTouchDistance(e);
      initialTouchScale.current = modalScale;
    } else if (e.touches.length === 1 && modalScale > 1) {
      setIsModalDragging(true);
      modalDragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      modalPosStart.current = { ...modalPos };
    }
  };

  const handleModalTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialTouchDistance.current) {
      const currentDist = getTouchDistance(e);
      const ratio = currentDist / initialTouchDistance.current;
      const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number((initialTouchScale.current * ratio).toFixed(2))));
      setModalScale(nextScale);
      if (nextScale === 1) setModalPos({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && isModalDragging && modalScale > 1) {
      const dx = e.touches[0].clientX - modalDragStart.current.x;
      const dy = e.touches[0].clientY - modalDragStart.current.y;
      const maxOffset = (modalScale - 1) * 450;
      setModalPos({
        x: Math.min(maxOffset, Math.max(-maxOffset, modalPosStart.current.x + dx)),
        y: Math.min(maxOffset, Math.max(-maxOffset, modalPosStart.current.y + dy)),
      });
    }
  };

  const handleModalTouchEnd = () => {
    initialTouchDistance.current = null;
    setIsModalDragging(false);
  };

  // Keyboard Shortcuts เมื่อเปิด Modal & Body Scroll Lock
  useEffect(() => {
    if (!isModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      } else if (e.key === "+" || e.key === "=") {
        handleModalZoomIn();
      } else if (e.key === "-" || e.key === "_") {
        handleModalZoomOut();
      } else if (e.key === "0") {
        handleModalReset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, closeModal, handleModalZoomIn, handleModalZoomOut, handleModalReset]);

  // ถ้าไม่ใช่รูปจริง แสดง Thumbnail ปกติ
  if (!isReal) {
    return (
      <div className={`relative aspect-4/3 overflow-hidden rounded-card border border-ink-100 bg-ink-50 ${className}`}>
        <ProductThumb src={src} alt={alt} priority={priority} sizes={sizes} />
      </div>
    );
  }

  return (
    <>
      {/* กล่องแสดงภาพหลักบนหน้าสินค้า (Inline Box) */}
      <div
        className={`group relative aspect-4/3 overflow-hidden rounded-card border border-ink-100 bg-ink-50 shadow-xs transition-shadow hover:shadow-md ${className} ${
          inlineScale > 1 ? (isInlineDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
        }`}
        onMouseDown={handleInlineMouseDown}
        onMouseMove={handleInlineMouseMove}
        onMouseUp={handleInlineMouseUp}
        onMouseLeave={handleInlineMouseUp}
        onDoubleClick={handleInlineDoubleClick}
        onClick={(e) => {
          // ถ้าไม่ได้ซูม inline อยู่ คลิกเปิด Modal ทันที
          if (inlineScale === 1 && !isInlineDragging) {
            openModal();
          }
        }}
        title={inlineScale > 1 ? "คลิกลากเพื่อเลื่อนดูภาพ หรือดับเบิลคลิกเพื่อรีเซ็ต" : "คลิกเพื่อดูรูปขยาย / ซูม"}
      >
        {/* รูปสินค้าหลักพร้อม Transform สำหรับ Inline Zoom */}
        <div
          className="relative size-full transition-transform duration-150 ease-out"
          style={{
            transform: `scale(${inlineScale}) translate(${inlinePos.x / inlineScale}px, ${inlinePos.y / inlineScale}px)`,
            transformOrigin: "center center",
          }}
        >
          <Image
            src={src!}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            className="object-contain p-2 select-none"
            draggable={false}
          />
        </div>

        {/* ป้ายกำกับบนขวา: แนะนำการคลิกเพื่อซูม */}
        <div className="pointer-events-none absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-ink-900/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md opacity-90 transition-opacity group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 8v6M8 11h6" />
          </svg>
          <span>คลิกเพื่อขยาย</span>
        </div>

        {/* แถบควบคุม Zoom ด้านล่างของการ์ด (Inline Toolbar) */}
        <div
          className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg border border-white/40 bg-white/80 p-1 shadow-md backdrop-blur-md transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ปุ่ม Zoom Out (-) */}
          <button
            type="button"
            onClick={handleInlineZoomOut}
            disabled={inlineScale <= MIN_SCALE}
            aria-label="ซูมออก"
            title="ซูมออก (-)"
            className="flex size-7 items-center justify-center rounded-md text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900 disabled:opacity-35 disabled:hover:bg-transparent"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
            </svg>
          </button>

          {/* แสดงระดับ % ซูม หรือปุ่มรีเซ็ต */}
          <button
            type="button"
            onClick={handleInlineReset}
            title={inlineScale !== 1 ? "คลิกเพื่อรีเซ็ตขนาดเริ่มต้น" : undefined}
            className="min-w-12 px-1 text-center text-xs font-semibold text-ink-700 hover:text-brand-600"
          >
            {Math.round(inlineScale * 100)}%
          </button>

          {/* ปุ่ม Zoom In (+) */}
          <button
            type="button"
            onClick={handleInlineZoomIn}
            disabled={inlineScale >= MAX_SCALE}
            aria-label="ซูมเข้า"
            title="ซูมเข้า (+)"
            className="flex size-7 items-center justify-center rounded-md text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900 disabled:opacity-35 disabled:hover:bg-transparent"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
          </button>

          {/* เส้นคั่น */}
          <div className="h-4 w-px bg-ink-200" />

          {/* ปุ่มเปิดโหมดเต็มจอ / Lightbox */}
          <button
            type="button"
            onClick={openModal}
            aria-label="ดูภาพขนาดใหญ่เต็มจอ"
            title="ดูภาพขนาดใหญ่เต็มจอ"
            className="flex size-7 items-center justify-center rounded-md text-ink-700 transition-colors hover:bg-ink-100 hover:text-brand-600"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* Fullscreen Zoom Lightbox Modal */}
      {/* =================================================================== */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`รูปภาพขยาย: ${alt}`}
          className="fixed inset-0 z-50 flex flex-col bg-ink-950/90 text-white backdrop-blur-lg select-none"
          onClick={closeModal}
        >
          {/* Header แถบบน */}
          <div
            className="flex shrink-0 items-center justify-between border-b border-white/10 bg-ink-900/60 px-4 py-3 backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-brand-500/20 px-2 py-0.5 text-xs font-semibold text-brand-300">
                ZOOM VIEWER
              </span>
              <h2 className="line-clamp-1 text-sm font-medium text-ink-100 sm:text-base">
                {alt}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-ink-400 md:inline">
                {Math.round(modalScale * 100)}%
              </span>
              <button
                type="button"
                onClick={closeModal}
                aria-label="ปิดหน้าต่างซูม"
                className="flex size-8 items-center justify-center rounded-full bg-white/10 text-ink-200 transition-colors hover:bg-white/20 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Canvas พื้นที่แสดงรูปภาพขนาดใหญ่ */}
          <div
            className={`relative flex flex-1 items-center justify-center overflow-hidden p-4 ${
              modalScale > 1 ? (isModalDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
            }`}
            onMouseDown={handleModalMouseDown}
            onMouseMove={handleModalMouseMove}
            onMouseUp={handleModalMouseUp}
            onMouseLeave={handleModalMouseUp}
            onWheel={handleModalWheel}
            onTouchStart={handleModalTouchStart}
            onTouchMove={handleModalTouchMove}
            onTouchEnd={handleModalTouchEnd}
            onDoubleClick={handleModalDoubleClick}
            onClick={(e) => {
              if (e.target === e.currentTarget && !isModalDragging) {
                closeModal();
              }
            }}
          >
            <div
              className="relative max-h-[82vh] max-w-[90vw] transition-transform duration-100 ease-out"
              style={{
                transform: `scale(${modalScale}) translate(${modalPos.x / modalScale}px, ${modalPos.y / modalScale}px)`,
                transformOrigin: "center center",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* รูปขนาดเต็มแบบ crisp */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src!}
                alt={alt}
                draggable={false}
                className="max-h-[80vh] max-w-[85vw] rounded-lg object-contain shadow-2xl drop-shadow-2xl select-none"
              />
            </div>
          </div>

          {/* Toolbar ด้านล่างสำหรับควบคุมการซูมแบบครบวงจร */}
          <div
            className="flex shrink-0 flex-col items-center justify-center gap-2 border-t border-white/10 bg-ink-900/70 px-4 py-3 backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              {/* กลุ่มปุ่ม Zoom In / Out */}
              <div className="flex items-center rounded-xl bg-white/10 p-1 backdrop-blur-md">
                <button
                  type="button"
                  onClick={handleModalZoomOut}
                  disabled={modalScale <= MIN_SCALE}
                  aria-label="ซูมออก"
                  title="ซูมออก (กด -)"
                  className="flex size-9 items-center justify-center rounded-lg text-ink-200 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                  </svg>
                </button>

                {/* ตัวเลือกสเกล / ตัวเลข % */}
                <div className="min-w-16 px-2 text-center text-sm font-semibold text-ink-100">
                  {Math.round(modalScale * 100)}%
                </div>

                <button
                  type="button"
                  onClick={handleModalZoomIn}
                  disabled={modalScale >= MAX_SCALE}
                  aria-label="ซูมเข้า"
                  title="ซูมเข้า (กด +)"
                  className="flex size-9 items-center justify-center rounded-lg text-ink-200 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>

              {/* Slider ปรับระดับ Zoom แบบละเอียด */}
              <div className="hidden items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 sm:flex">
                <span className="text-xs text-ink-400">1x</span>
                <input
                  type="range"
                  min={MIN_SCALE}
                  max={MAX_SCALE}
                  step={0.1}
                  value={modalScale}
                  onChange={(e) => handleModalSetScale(parseFloat(e.target.value))}
                  aria-label="ระดับการซูม"
                  className="h-1.5 w-24 cursor-pointer accent-brand-400 sm:w-32"
                />
                <span className="text-xs text-ink-400">4x</span>
              </div>

              {/* Preset buttons */}
              <div className="flex items-center gap-1 rounded-xl bg-white/10 p-1">
                <button
                  type="button"
                  onClick={() => handleModalSetScale(1)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    modalScale === 1
                      ? "bg-brand-500 text-white font-bold"
                      : "text-ink-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  100%
                </button>
                <button
                  type="button"
                  onClick={() => handleModalSetScale(2)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    modalScale === 2
                      ? "bg-brand-500 text-white font-bold"
                      : "text-ink-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  200%
                </button>
                <button
                  type="button"
                  onClick={() => handleModalSetScale(3)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    modalScale === 3
                      ? "bg-brand-500 text-white font-bold"
                      : "text-ink-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  300%
                </button>
              </div>

              {/* ปุ่มรีเซ็ต */}
              <button
                type="button"
                onClick={handleModalReset}
                title="รีเซ็ตกลับขนาดปกติ (กด 0)"
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-medium text-ink-200 transition-colors hover:bg-white/20 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>รีเซ็ต</span>
              </button>
            </div>

            {/* คำแนะนำคีย์ลัด / การใช้งาน */}
            <p className="text-[11px] text-ink-400">
              หมุนลูกกลิ้งเมาส์เพื่อซูม · ลากเมาส์เพื่อเลื่อนดูรายละเอียด · ดับเบิลคลิกเพื่อซูมด่วน · กด ESC เพื่อปิด
            </p>
          </div>
        </div>
      )}
    </>
  );
}
