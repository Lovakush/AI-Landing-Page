'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Chatbot from '@/components/ui/chatbot';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { useState, useEffect, useRef } from 'react';

const tetrisPieces = [
  {
    id: 1,
    shape: [
      [1, 0, 0, 0, 0],
      [1, 1, 0, 0, 0],
      [1, 1, 1, 0, 0]
    ],
    icon: '🤖',
    iconPos: [1, 1],
    color: '#A855F7',
    targetRow: 2,
  },
  {
    id: 2,
    shape: [
      [0, 0, 0, 1, 0],
      [0, 0, 1, 1, 0],
      [0, 0, 0, 1, 0]
    ],
    icon: '⚙️',
    iconPos: [1, 3],
    color: '#06B6D4',
    targetRow: 2,
  },
  {
    id: 3,
    shape: [
      [0, 0, 0, 0, 1],
      [0, 0, 0, 0, 1],
      [0, 0, 0, 0, 1],
      [0, 0, 0, 0, 1],
      [0, 0, 0, 0, 1]
    ],
    icon: '⛓️',
    iconPos: [2, 4],
    color: '#94A3B8',
    targetRow: 0,
  },
  {
    id: 4,
    shape: [
      [0, 0, 1, 1, 0],
      [0, 0, 1, 1, 0],
      [0, 1, 1, 0, 0]
    ],
    icon: '📈',
    iconPos: [1, 2],
    color: '#10B981',
    targetRow: 0,
  },
  {
    id: 5,
    shape: [
      [1, 1, 0, 0, 0],
      [1, 1, 0, 0, 0]
    ],
    icon: '🏢',
    iconPos: [0, 0],
    color: '#E8B84A',
    targetRow: 0,
  },
];

const GRID_ROWS = 5;
const GRID_COLS = 5;
const BLOCK_SIZE = 55;

function TetrisAnimation({ onSubtitleTrigger, onPieceChange }: { onSubtitleTrigger: () => void; onPieceChange: (index: number) => void }) {
  const [board, setBoard] = useState<Array<Array<{ color: string; icon?: string } | null>>>(() =>
    Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null))
  );
  const [fallingPiece, setFallingPiece] = useState<{
    pieceId: number;
    row: number;
    col: number;
  } | null>(null);
  const [currentPieceIndex, setCurrentPieceIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [scrollLocked, setScrollLocked] = useState(false);
  const [sectionActivated, setSectionActivated] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [justLanded, setJustLanded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef(0);

  const placePiece = (pieceData: typeof tetrisPieces[0], row: number, col: number) => {
    setBoard((prevBoard) => {
      const newBoard = prevBoard.map(r => [...r]);
      pieceData.shape.forEach((shapeRow, r) => {
        shapeRow.forEach((cell, c) => {
          if (cell === 1) {
            const boardRow = row + r;
            const boardCol = col + c;
            if (boardRow >= 0 && boardRow < GRID_ROWS && boardCol >= 0 && boardCol < GRID_COLS) {
              // For SIA logo piece, mark all cells with the icon
              const shouldHaveIcon = pieceData.icon === '🏢' || (pieceData.iconPos[0] === r && pieceData.iconPos[1] === c);
              newBoard[boardRow][boardCol] = {
                color: pieceData.color,
                icon: shouldHaveIcon ? pieceData.icon : undefined,
              };
            }
          }
        });
      });
      return newBoard;
    });
  };

  useEffect(() => {
    const dropPiece = (pieceIndex: number) => {
      if (pieceIndex >= tetrisPieces.length || isAnimating) return;

      setIsAnimating(true);
      const piece = tetrisPieces[pieceIndex];
      const startCol = 0;
      const startRow = -piece.shape.length;
      const targetRow = piece.targetRow;

      setFallingPiece({ pieceId: piece.id, row: startRow, col: startCol });

      let currentRow = startRow;

      const fall = () => {
        const nextRow = currentRow + 1;

        if (nextRow < targetRow) {
          currentRow = nextRow;
          setFallingPiece({ pieceId: piece.id, row: currentRow, col: startCol });

          // Gradual deceleration as piece approaches target
          const distanceToTarget = targetRow - nextRow;
          const fallSpeed = distanceToTarget <= 1 ? 160 : distanceToTarget <= 2 ? 110 : 80;

          setTimeout(fall, fallSpeed);
        } else {
          // Update falling piece to final position first
          setFallingPiece({ pieceId: piece.id, row: targetRow, col: startCol });

          // Trigger text change immediately when piece lands
          onPieceChange(pieceIndex + 1);

          // Wait for visual animation to complete before placing on board
          setTimeout(() => {
            placePiece(piece, targetRow, startCol);
            setFallingPiece(null);
            setCurrentPieceIndex(pieceIndex + 1);
            setIsAnimating(false);

            // Trigger grid damping animation
            setJustLanded(true);
            setTimeout(() => setJustLanded(false), 400);

            // Trigger subtitle when SIA piece lands
            if (pieceIndex === tetrisPieces.length - 1) {
              onSubtitleTrigger();
            }

            // Unlock scroll after last piece lands with a delay
            if (pieceIndex + 1 >= tetrisPieces.length) {
              setAnimationComplete(true);
              setTimeout(() => {
                setScrollLocked(false);
              }, 800);
            }
          }, 200);
        }
      };

      setTimeout(fall, 100);
    };

    const handleScroll = () => {
      if (!sectionRef.current || sectionActivated) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const isMidPage = rect.top <= windowHeight * 0.5 && rect.top >= windowHeight * 0.3;

      if (isMidPage && !sectionActivated) {
        setSectionActivated(true);
        setScrollLocked(true);
        dropPiece(0);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (!scrollLocked) return;

      // Always prevent scroll when locked, even during animation
      if (currentPieceIndex < tetrisPieces.length) {
        e.preventDefault();
      }

      // Only drop new piece if not animating and enough time has passed
      if (isAnimating) return;

      const now = Date.now();
      if (now - lastScrollTime.current < 500) return;
      lastScrollTime.current = now;

      if (currentPieceIndex < tetrisPieces.length) {
        dropPiece(currentPieceIndex);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [currentPieceIndex, isAnimating, scrollLocked, sectionActivated]);

  return (
    <div ref={sectionRef} className="relative w-full h-full flex items-start justify-center pt-4">
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="grid grid-cols-5 gap-[1px]">
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} className="w-10 h-10 border border-white/5" />
          ))}
        </div>
      </div>

      <motion.div
        className="relative transition-all duration-1000"
        style={{
          width: `${GRID_COLS * BLOCK_SIZE}px`,
          height: `${GRID_ROWS * BLOCK_SIZE + 200}px`,
          filter: animationComplete ? 'drop-shadow(0 0 20px rgba(232, 184, 74, 0.25)) drop-shadow(0 0 40px rgba(232, 184, 74, 0.15))' : 'none'
        }}
        animate={{
          y: justLanded ? [0, -3, 0] : 0,
        }}
        transition={{
          y: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            if (!cell) return null;

            // Check if this is part of a 2x2 SIA logo block
            const isSiaLogo = cell.icon === '🏢';
            const isTopLeft = isSiaLogo &&
              board[rowIndex]?.[colIndex]?.icon === '🏢' &&
              board[rowIndex]?.[colIndex + 1]?.icon === '🏢' &&
              board[rowIndex + 1]?.[colIndex]?.icon === '🏢' &&
              board[rowIndex + 1]?.[colIndex + 1]?.icon === '🏢';

            // Skip rendering if it's part of SIA logo but not the top-left cell
            if (isSiaLogo && !isTopLeft) {
              // Check if this cell is part of a 2x2 block where top-left exists
              const isPartOfBlock = (
                (rowIndex > 0 && colIndex > 0 && board[rowIndex - 1]?.[colIndex - 1]?.icon === '🏢') ||
                (rowIndex > 0 && board[rowIndex - 1]?.[colIndex]?.icon === '🏢' && board[rowIndex - 1]?.[colIndex + 1]?.icon === '🏢') ||
                (colIndex > 0 && board[rowIndex]?.[colIndex - 1]?.icon === '🏢' && board[rowIndex + 1]?.[colIndex - 1]?.icon === '🏢')
              );
              if (isPartOfBlock) return null;
            }

            // Calculate distance from SIA figure center (0.5, 0.5) for radial animation
            const siaCenter = { row: 0.5, col: 0.5 };
            const distance = Math.sqrt(
              Math.pow(rowIndex - siaCenter.row, 2) + Math.pow(colIndex - siaCenter.col, 2)
            );
            const colorDelay = animationComplete ? distance * 0.15 : 0;

            const displayColor = animationComplete ? '#E8B84A' : cell.color;

            return (
              <motion.div
                key={`${rowIndex}-${colIndex}`}
                className="absolute border-[3px] flex items-center justify-center text-2xl rounded-lg"
                style={{
                  width: isTopLeft ? `${BLOCK_SIZE * 2}px` : `${BLOCK_SIZE}px`,
                  height: isTopLeft ? `${BLOCK_SIZE * 2}px` : `${BLOCK_SIZE}px`,
                  left: `${colIndex * BLOCK_SIZE}px`,
                  top: `${rowIndex * BLOCK_SIZE}px`,
                  backdropFilter: 'blur(12px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                  backgroundImage: `linear-gradient(135deg, ${displayColor}0a 0%, ${displayColor}05 50%, ${displayColor}08 100%)`,
                }}
                initial={{
                  y: -2,
                  backgroundColor: cell.icon === '🏢' && animationComplete ? `${cell.color}08` : cell.icon === '🏢' ? `${cell.color}08` : animationComplete ? `${cell.color}08` : `${cell.color}08`,
                  borderColor: cell.icon === '🏢' && animationComplete ? `${cell.color}99` : cell.icon === '🏢' ? `${cell.color}99` : animationComplete ? `${cell.color}99` : `${cell.color}70`,
                  boxShadow: cell.icon === '🏢' && animationComplete
                    ? `0 2px 12px ${displayColor}30, inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -1px 2px ${displayColor}20, 0 0 15px ${displayColor}50, 0 0 30px ${displayColor}30`
                    : cell.icon === '🏢'
                    ? `0 2px 12px ${displayColor}15, inset 0 1px 2px rgba(255,255,255,0.08), inset 0 -1px 2px ${displayColor}10, 0 0 5px ${displayColor}20`
                    : animationComplete
                    ? `0 2px 12px ${displayColor}20, inset 0 1px 2px rgba(255,255,255,0.1), inset 0 -1px 2px ${displayColor}15, 0 0 6px ${displayColor}30`
                    : `0 2px 12px ${displayColor}20, inset 0 1px 2px rgba(255,255,255,0.1), inset 0 -1px 2px ${displayColor}15`,
                }}
                animate={
                  cell.icon === '🏢' && animationComplete
                    ? {
                        y: 0,
                        backgroundColor: [`${cell.color}08`, `${cell.color}04`, `#E8B84A08`],
                        borderColor: [`${cell.color}99`, `${cell.color}50`, `#E8B84A99`],
                        // Strong pulsing glow for SIA figure after grid complete
                        boxShadow: [
                          `0 2px 12px ${displayColor}30, inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -1px 2px ${displayColor}20, 0 0 15px ${displayColor}50, 0 0 30px ${displayColor}30`,
                          `0 2px 12px ${displayColor}30, inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -1px 2px ${displayColor}20, 0 0 25px ${displayColor}70, 0 0 45px ${displayColor}40`,
                          `0 2px 12px ${displayColor}30, inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -1px 2px ${displayColor}20, 0 0 15px ${displayColor}50, 0 0 30px ${displayColor}30`,
                        ],
                      }
                    : cell.icon === '🏢'
                    ? {
                        y: 0,
                        backgroundColor: `${cell.color}08`,
                        borderColor: `${cell.color}99`,
                        // SIA figure before grid completion - single pulse then settle
                        boxShadow: [
                          `0 2px 12px ${displayColor}15, inset 0 1px 2px rgba(255,255,255,0.08), inset 0 -1px 2px ${displayColor}10, 0 0 5px ${displayColor}20`,
                          `0 0 35px ${displayColor}85, 0 0 18px ${displayColor}65, inset 0 0 12px ${displayColor}35`,
                          `0 2px 12px ${displayColor}25, inset 0 1px 2px rgba(255,255,255,0.12), inset 0 -1px 2px ${displayColor}18, 0 0 8px ${displayColor}35`,
                        ],
                      }
                    : animationComplete
                    ? {
                        y: 0,
                        backgroundColor: [`${cell.color}08`, `${cell.color}04`, `#E8B84A08`],
                        borderColor: [`${cell.color}99`, `${cell.color}50`, `#E8B84A99`],
                        // Weak pulsing glow for other figures when grid is complete
                        boxShadow: [
                          `0 2px 12px ${displayColor}20, inset 0 1px 2px rgba(255,255,255,0.1), inset 0 -1px 2px ${displayColor}15, 0 0 6px ${displayColor}30`,
                          `0 2px 12px ${displayColor}20, inset 0 1px 2px rgba(255,255,255,0.1), inset 0 -1px 2px ${displayColor}15, 0 0 12px ${displayColor}45`,
                          `0 2px 12px ${displayColor}20, inset 0 1px 2px rgba(255,255,255,0.1), inset 0 -1px 2px ${displayColor}15, 0 0 6px ${displayColor}30`,
                        ],
                      }
                    : {
                        y: 0,
                        backgroundColor: `${cell.color}08`,
                        borderColor: `${cell.color}70`,
                        // Base shadow for regular figures
                        boxShadow: `0 2px 12px ${displayColor}20, inset 0 1px 2px rgba(255,255,255,0.1), inset 0 -1px 2px ${displayColor}15`,
                      }
                }
                transition={
                  cell.icon === '🏢' || animationComplete
                    ? {
                        y: { type: 'spring', damping: 18, stiffness: 200, duration: 0.5 },
                        backgroundColor: { delay: colorDelay, duration: 1.2, ease: 'easeOut', times: [0, 0.25, 1] },
                        borderColor: { delay: colorDelay, duration: 1.2, ease: 'easeOut', times: [0, 0.25, 1] },
                        boxShadow: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                      }
                    : {
                        y: { type: 'spring', damping: 18, stiffness: 200, duration: 0.5 },
                        backgroundColor: { duration: 0 },
                        borderColor: { duration: 0 },
                        boxShadow: { duration: 0 }
                      }
                }
              >
                {cell.icon && (
                  <>
                    {cell.icon === '🏢' ? (
                      <motion.img
                        src="/sia-logo.png"
                        alt="SIA"
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'contain',
                          opacity: 1
                        }}
                        animate={{
                          filter: animationComplete
                            ? [
                                'drop-shadow(0 0 20px #E8B84A) drop-shadow(0 0 12px #E8B84ACC) brightness(0) saturate(100%) invert(77%) sepia(63%) saturate(446%) hue-rotate(359deg) brightness(101%) contrast(93%)',
                                'drop-shadow(0 0 35px #E8B84A) drop-shadow(0 0 20px #E8B84ACC) brightness(0) saturate(100%) invert(77%) sepia(63%) saturate(446%) hue-rotate(359deg) brightness(101%) contrast(93%)',
                                'drop-shadow(0 0 20px #E8B84A) drop-shadow(0 0 12px #E8B84ACC) brightness(0) saturate(100%) invert(77%) sepia(63%) saturate(446%) hue-rotate(359deg) brightness(101%) contrast(93%)',
                              ]
                            : 'drop-shadow(0 0 8px #E8B84A70) brightness(0) saturate(100%) invert(77%) sepia(63%) saturate(446%) hue-rotate(359deg) brightness(101%) contrast(93%)',
                        }}
                        transition={{
                          filter: animationComplete
                            ? { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                            : { duration: 0.5 }
                        }}
                      />
                    ) : (
                      <svg
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={animationComplete ? '#E8B84A' : cell.color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ filter: `drop-shadow(0 0 6px ${animationComplete ? '#E8B84A' : cell.color}50)` }}
                      >
                        {cell.icon === '🤖' && (
                          <>
                            <rect x="4" y="8" width="16" height="12" rx="2" />
                            <path d="M8 12h8M8 16h8M12 8V4M8 4h8" />
                          </>
                        )}
                        {cell.icon === '⚙️' && (
                          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
                        )}
                        {cell.icon === '⛓️' && (
                          <>
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </>
                        )}
                        {cell.icon === '📈' && (
                          <>
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                          </>
                        )}
                      </svg>
                    )}
                  </>
                )}
              </motion.div>
            );
          })
        )}

        {fallingPiece && (() => {
          const pieceData = tetrisPieces.find(p => p.id === fallingPiece.pieceId)!;
          const isAtTarget = fallingPiece.row === pieceData.targetRow;
          return (
            <motion.div
              className="absolute"
              style={{
                left: `${fallingPiece.col * BLOCK_SIZE}px`,
                top: `${(fallingPiece.row < 0 ? -Math.abs(fallingPiece.row) * BLOCK_SIZE : fallingPiece.row * BLOCK_SIZE)}px`,
              }}
              initial={{ opacity: 0 }}
              animate={{
                top: `${(fallingPiece.row < 0 ? -Math.abs(fallingPiece.row) * BLOCK_SIZE : fallingPiece.row * BLOCK_SIZE)}px`,
                opacity: 1,
              }}
              transition={{
                top: { duration: 0.2, ease: 'easeOut' },
                opacity: { duration: 0.7, ease: 'easeOut' }
              }}
            >
              <div className="relative">
                {pieceData.icon === '🏢' ? (
                  <motion.div
                    className="border-[3px] flex items-center justify-center text-2xl rounded-lg relative"
                    style={{
                      width: `${BLOCK_SIZE * 2}px`,
                      height: `${BLOCK_SIZE * 2}px`,
                      backgroundColor: `${pieceData.color}08`,
                      borderColor: `${pieceData.color}99`,
                      backdropFilter: 'blur(12px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                      backgroundImage: `linear-gradient(135deg, ${pieceData.color}0a 0%, ${pieceData.color}05 50%, ${pieceData.color}08 100%)`,
                    }}
                    animate={
                      isAtTarget
                        ? {
                            boxShadow: [
                              `0 2px 12px ${pieceData.color}15, inset 0 1px 2px rgba(255,255,255,0.08), inset 0 -1px 2px ${pieceData.color}10, 0 0 5px ${pieceData.color}20`,
                              `0 0 40px ${pieceData.color}90, 0 0 20px ${pieceData.color}70, inset 0 0 15px ${pieceData.color}40`,
                              `0 2px 12px ${pieceData.color}20, inset 0 1px 2px rgba(255,255,255,0.1), inset 0 -1px 2px ${pieceData.color}15`
                            ]
                          }
                        : {
                            boxShadow: `0 2px 12px ${pieceData.color}20, inset 0 1px 2px rgba(255,255,255,0.1), inset 0 -1px 2px ${pieceData.color}15`
                          }
                    }
                    transition={
                      isAtTarget
                        ? {
                            boxShadow: {
                              duration: 1,
                              ease: 'easeInOut',
                              times: [0, 0.3, 1],
                              delay: 0.2
                            }
                          }
                        : {}
                    }
                  >
                    <img
                      src="/sia-logo.png"
                      alt="SIA"
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 0 12px #E8B84A90) brightness(0) saturate(100%) invert(77%) sepia(63%) saturate(446%) hue-rotate(359deg) brightness(101%) contrast(93%)',
                        opacity: 1
                      }}
                    />
                  </motion.div>
                ) : (
                pieceData.shape.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex">
                    {row.map((cell, colIndex) => (
                      <div
                        key={colIndex}
                        className="relative"
                        style={{ width: `${BLOCK_SIZE}px`, height: `${BLOCK_SIZE}px` }}
                      >
                        {cell === 1 && (
                          <motion.div
                            className="w-full h-full border-[3px] flex items-center justify-center text-2xl rounded-lg relative"
                            style={{
                              backgroundColor: `${pieceData.color}08`,
                              borderColor: `${pieceData.color}99`,
                              backdropFilter: 'blur(12px) saturate(180%)',
                              WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                              backgroundImage: `linear-gradient(135deg, ${pieceData.color}0a 0%, ${pieceData.color}05 50%, ${pieceData.color}08 100%)`,
                            }}
                            animate={
                              isAtTarget
                                ? {
                                    boxShadow: [
                                      `0 2px 12px ${pieceData.color}15, inset 0 1px 2px rgba(255,255,255,0.08), inset 0 -1px 2px ${pieceData.color}10, 0 0 5px ${pieceData.color}20`,
                                      `0 0 40px ${pieceData.color}90, 0 0 20px ${pieceData.color}70, inset 0 0 15px ${pieceData.color}40`,
                                      `0 2px 12px ${pieceData.color}20, inset 0 1px 2px rgba(255,255,255,0.1), inset 0 -1px 2px ${pieceData.color}15`
                                    ]
                                  }
                                : {
                                    boxShadow: `0 2px 12px ${pieceData.color}20, inset 0 1px 2px rgba(255,255,255,0.1), inset 0 -1px 2px ${pieceData.color}15`
                                  }
                            }
                            transition={
                              isAtTarget
                                ? {
                                    boxShadow: {
                                      duration: 1,
                                      ease: 'easeInOut',
                                      times: [0, 0.3, 1],
                                      delay: 0.2
                                    }
                                  }
                                : {}
                            }
                          >
                            {pieceData.iconPos[0] === rowIndex && pieceData.iconPos[1] === colIndex && (
                              <svg
                                width="30"
                                height="30"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={pieceData.color}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ filter: `drop-shadow(0 0 6px ${pieceData.color}50)` }}
                              >
                                {pieceData.icon === '🤖' && (
                                  <>
                                    <rect x="4" y="8" width="16" height="12" rx="2" />
                                    <path d="M8 12h8M8 16h8M12 8V4M8 4h8" />
                                  </>
                                )}
                                {pieceData.icon === '⚙️' && (
                                  <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
                                )}
                                {pieceData.icon === '⛓️' && (
                                  <>
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                  </>
                                )}
                                {pieceData.icon === '📈' && (
                                  <>
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                  </>
                                )}
                              </svg>
                            )}
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              )}
              </div>
            </motion.div>
          );
        })()}
      </motion.div>
    </div>
  );
}

export default function AboutPage() {
  const [activePanel, setActivePanel] = useState<'why' | 'how' | 'what' | null>(null);
  const [activeWorkPanel, setActiveWorkPanel] = useState<'pain' | 'solution' | 'live' | null>(null);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [currentPiece, setCurrentPiece] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Body background to prevent white flash + smooth scroll snap via CSS
  useEffect(() => {
    document.body.style.background = '#0c0118';

    const style = document.createElement('style');
    style.textContent = `
      html {
        scroll-snap-type: y proximity;
        scroll-behavior: smooth;
      }
      @media (prefers-reduced-motion: no-preference) {
        html {
          scroll-padding-top: 0px;
        }
      }
      section[data-snap] {
        scroll-snap-align: start;
        scroll-snap-stop: normal;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.body.style.background = '';
      style.remove();
    };
  }, []);

  const showPanel = (panel: 'why' | 'how' | 'what') => {
    setActivePanel(panel);
  };

  const resetPanel = () => {
    setActivePanel(null);
  };

  const showWorkPanel = (panel: 'pain' | 'solution' | 'live') => {
    setActiveWorkPanel(panel);
  };

  const resetWorkPanel = () => {
    setActiveWorkPanel(null);
  };

  return (
    <div ref={containerRef} className="min-h-screen" style={{ background: 'linear-gradient(160deg, #12041a 0%, #1e0835 30%, #2a0d4a 55%, #160228 80%, #0c0118 100%)' }}>
      <Navbar />

      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-6 md:px-10 lg:px-16 min-h-screen flex items-center" data-snap>
        <motion.div
          className="max-w-7xl mx-auto w-full"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center min-h-[400px] lg:min-h-[500px]">
            <div className="relative min-h-52 lg:min-h-72 text-center lg:text-left">
              <AnimatePresence mode="wait">
                {!activePanel && (
                  <motion.div
                    key="hero"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-4 leading-tight tracking-tighter">
                      The AI revolution is <em className="italic text-[#E8B84A]">already here.</em>
                    </h1>
                    <p className="text-base md:text-lg text-white/70 font-light mb-6 leading-relaxed">
                      The story, mission, and value behind SIA
                    </p>
                    <span className="text-xs md:text-sm text-white/40 font-normal tracking-wider">
                      Click the circle to explore our story →
                    </span>
                  </motion.div>
                )}

                {activePanel === 'why' && (
                  <motion.div
                    key="why"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="inline-block px-4 py-1 rounded-full bg-[#A855F7]/10 mb-6">
                      <span className="text-xs font-semibold tracking-widest text-[#A855F7] uppercase">Why we exist</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-white mb-4 leading-tight tracking-tight">
                      The future is arriving faster than businesses can react.
                    </h3>
                    <p className="text-base md:text-lg text-white/70 font-light leading-relaxed">
                      We exist to turn this uncertainty into an advantage — putting our customers in a position to act decisively, rather than reactively.
                    </p>
                    <button
                      onClick={resetPanel}
                      className="mt-6 text-sm font-medium text-[#A855F7] hover:opacity-70 transition-opacity"
                    >
                      ← Back
                    </button>
                  </motion.div>
                )}

                {activePanel === 'how' && (
                  <motion.div
                    key="how"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="inline-block px-4 py-1 rounded-full bg-[#06B6D4]/10 mb-6">
                      <span className="text-xs font-semibold tracking-widest text-[#06B6D4] uppercase">How we do it</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-white mb-4 leading-tight tracking-tight">
                      Global reach. In-house brains. Relentless speed.
                    </h3>
                    <p className="text-base md:text-lg text-white/70 font-light leading-relaxed">
                      We combine a global footprint with deep in-house expertise and rapid execution — allowing us to adapt and deploy solutions tailored to each client.
                    </p>
                    <button
                      onClick={resetPanel}
                      className="mt-6 text-sm font-medium text-[#06B6D4] hover:opacity-70 transition-opacity"
                    >
                      ← Back
                    </button>
                  </motion.div>
                )}

                {activePanel === 'what' && (
                  <motion.div
                    key="what"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="inline-block px-4 py-1 rounded-full bg-[#E8B84A]/10 mb-6">
                      <span className="text-xs font-semibold tracking-widest text-[#E8B84A] uppercase">What we build</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-white mb-9 leading-tight tracking-tight">
                      Plug-and-play AI agents for the workflows that matter.
                    </h3>
                    <p className="text-base md:text-lg text-white/70 font-light leading-relaxed">
                      Domain-specific AI agents that automate critical workflows for startups and SMEs — freeing teams to focus on high-value growth.
                    </p>
                    <button
                      onClick={resetPanel}
                      className="mt-6 text-sm font-medium text-[#E8B84A] hover:opacity-70 transition-opacity"
                    >
                      ← Back
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative flex justify-center">
              <div
                className="relative w-[450px] h-64 pt-12 overflow-hidden scale-[0.65] sm:scale-[0.8] lg:scale-100 origin-center"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)',
                }}
              >
                <div className="relative w-[450px] h-[450px] -mt-4">
                  <motion.div
                    onClick={() => showPanel('why')}
                    className={`absolute rounded-full border-2 cursor-pointer transition-all duration-500 ${
                      activePanel === 'why'
                        ? 'border-[#A855F7]/50'
                        : 'border-white/12 hover:border-white/35'
                    }`}
                    style={{
                      width: '450px',
                      height: '450px',
                      top: '0px',
                      left: '0px',
                      background: activePanel === 'why'
                        ? 'rgba(168, 85, 247, 0.05)'
                        : 'radial-gradient(circle at center, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)',
                    }}
                    animate={{
                      y: activePanel === 'why' ? -8 : 0,
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div
                      className={`absolute text-xs font-semibold tracking-widest uppercase transition-all duration-500 px-3 py-1 rounded-full z-20 ${
                        activePanel === 'why'
                          ? 'text-[#A855F7] bg-white/90'
                          : 'text-white/40 bg-white/10'
                      }`}
                      style={{
                        left: '50%',
                        top: '0px',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      Why
                    </div>
                  </motion.div>

                  <motion.div
                    onClick={() => showPanel('how')}
                    className={`absolute rounded-full border-2 cursor-pointer transition-all duration-500 ${
                      activePanel === 'how'
                        ? 'border-[#06B6D4]/50'
                        : 'border-white/12 hover:border-white/35'
                    }`}
                    style={{
                      width: '310px',
                      height: '310px',
                      top: '70px',
                      left: '70px',
                      background: activePanel === 'how'
                        ? 'rgba(6, 182, 212, 0.05)'
                        : 'radial-gradient(circle at center, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    }}
                    animate={{
                      y: activePanel === 'how' ? -8 : 0,
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div
                      className={`absolute text-xs font-semibold tracking-widest uppercase transition-all duration-500 px-3 py-1 rounded-full z-10 ${
                        activePanel === 'how'
                          ? 'text-[#06B6D4] bg-white/90'
                          : 'text-white/40 bg-white/10'
                      }`}
                      style={{
                        left: '50%',
                        top: '2px',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      How
                    </div>
                  </motion.div>

                  <motion.div
                    onClick={() => showPanel('what')}
                    className={`absolute rounded-full border-2 cursor-pointer transition-all duration-500 ${
                      activePanel === 'what'
                        ? 'border-[#E8B84A]/50'
                        : 'border-white/12 hover:border-white/35'
                    }`}
                    style={{
                      width: '170px',
                      height: '170px',
                      top: '140px',
                      left: '140px',
                      background: activePanel === 'what'
                        ? 'rgba(232, 184, 74, 0.1)'
                        : 'radial-gradient(circle at center, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
                    }}
                    animate={{
                      y: activePanel === 'what' ? -8 : 0,
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div
                      className={`absolute text-xs font-semibold tracking-widest uppercase transition-all duration-500 px-3 py-1 rounded-full z-10 ${
                        activePanel === 'what'
                          ? 'text-[#E8B84A] bg-white/90'
                          : 'text-white/40 bg-white/10'
                      }`}
                      style={{
                        left: '48%',
                        top: '2px',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      What
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="py-16 md:py-32 px-6 md:px-10 lg:px-16 relative overflow-hidden min-h-screen flex items-center" data-snap>
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <motion.div
              className="text-center lg:text-left order-2 lg:order-1"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-light text-white mb-8 leading-tight tracking-tight">
                The giants are <em className="italic text-[#E8B84A]">pulling ahead.</em>
              </h2>
              <AnimatePresence mode="wait">
                {showSubtitle ? (
                  <motion.div
                    key="subtitle"
                    className="text-lg md:text-xl text-white font-medium pl-6 border-l-4 border-[#E8B84A] max-w-2xl mx-auto lg:mx-0 text-left"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  >
                    We started SIA to close the gap between AI solutions and enterprises that need it the most.
                  </motion.div>
                ) : currentPiece >= 4 ? (
                  <motion.p
                    key="text-4"
                    className="text-base md:text-lg text-white/70 font-light leading-relaxed max-w-2xl mx-auto lg:mx-0"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  >
                    Meanwhile, growing businesses are stuck choosing between expensive consultants, half-built tools, or doing everything manually.
                  </motion.p>
                ) : currentPiece >= 3 ? (
                  <motion.p
                    key="text-3"
                    className="text-base md:text-lg text-white/70 font-light leading-relaxed max-w-2xl mx-auto lg:mx-0"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  >
                    Widening the gap, every year.
                  </motion.p>
                ) : currentPiece >= 2 ? (
                  <motion.p
                    key="text-2"
                    className="text-base md:text-lg text-white/70 font-light leading-relaxed max-w-2xl mx-auto lg:mx-0"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  >
                    To decide smarter and outpace the market.
                  </motion.p>
                ) : currentPiece >= 1 ? (
                  <motion.p
                    key="text-1"
                    className="text-base md:text-lg text-white/70 font-light leading-relaxed max-w-2xl mx-auto lg:mx-0"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  >
                    The world's largest companies are using AI to move faster.
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </motion.div>

            <div className="relative min-h-[350px] lg:min-h-[500px] flex items-center justify-center order-1 lg:order-2 scale-[0.75] sm:scale-[0.85] lg:scale-100 origin-center">
              <TetrisAnimation
                onSubtitleTrigger={() => setShowSubtitle(true)}
                onPieceChange={(index) => setCurrentPiece(index)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-32 px-6 md:px-10 lg:px-16 min-h-screen flex items-center" data-snap>
        <div className="max-w-6xl mx-auto w-full">
          <motion.div
            className="text-center mb-12 md:mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-light text-white mb-6 leading-tight tracking-tight">
              We exist to <em className="italic text-[#E8B84A]">level the field.</em>
            </h2>
            <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
              Plug-and-play AI agents that automate critical workflows, so your team stops drowning in operations and starts focusing on growth.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: '⚡',
                title: '30 days, not 6 months',
                description: 'No drawn-out implementation timelines. No enterprise-only pricing. No 40-page SOW before you see results.',
                bg: 'bg-[#E8B84A]/10',
                color: 'text-[#E8B84A]',
              },
              {
                icon: '⚙️',
                title: 'Tailored to how you run',
                description: "We don't hand you a platform and wish you luck. We deploy solutions built for how your business actually operates.",
                bg: 'bg-[#E8B84A]/10',
                color: 'text-[#E8B84A]',
              },
              {
                icon: '🎯',
                title: 'Free your best people',
                description: 'Our agents handle the workflows that quietly eat your team\'s time — sales, reporting, follow-ups, internal ops.',
                bg: 'bg-[#E8B84A]/10',
                color: 'text-[#E8B84A]',
              },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                className="p-8 md:p-11 rounded-3xl border border-white/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                whileHover={{
                  background: 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <div className={`w-14 h-14 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center text-2xl mb-6`}>
                  {card.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{card.title}</h3>
                <p className="text-base text-white/70 font-light leading-relaxed">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-32 px-6 md:px-10 lg:px-16 min-h-screen flex items-center" data-snap>
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            className="text-center mb-10 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.8, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.h2
              className="text-3xl md:text-5xl lg:text-6xl font-light text-white mb-6 leading-tight tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.8 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              How it <em className="italic text-[#E8B84A]">works</em>
            </motion.h2>
            <motion.p
              className="text-base md:text-lg text-white/70 max-w-2xl mx-auto font-light leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false, amount: 0.8 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            >
              No 40-page SOW. No six-month timeline. Just a clear path from problem to production.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center min-h-[400px] lg:min-h-[500px]">
            <div className="relative flex justify-center">
              <div
                className="relative w-[450px] h-64 pt-12 overflow-hidden scale-[0.65] sm:scale-[0.8] lg:scale-100 origin-center"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)',
                }}
              >
                <div className="relative w-[450px] h-[450px] -mt-4">
                  <motion.div
                    onClick={() => showWorkPanel('live')}
                    className={`absolute rounded-full border-2 cursor-pointer transition-all duration-500 ${
                      activeWorkPanel === 'live'
                        ? 'border-[#06B6D4]/50'
                        : 'border-white/12 hover:border-white/35'
                    }`}
                    style={{
                      width: '450px',
                      height: '450px',
                      top: '0px',
                      left: '0px',
                      background: activeWorkPanel === 'live'
                        ? 'rgba(6, 182, 212, 0.05)'
                        : 'radial-gradient(circle at center, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)',
                    }}
                    animate={{
                      y: activeWorkPanel === 'live' ? -8 : 0,
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <motion.div
                      className={`absolute text-xs font-semibold tracking-widest uppercase transition-all duration-500 px-3 py-1 rounded-full z-20 whitespace-nowrap ${
                        activeWorkPanel === 'live'
                          ? 'text-[#06B6D4] bg-white/90'
                          : 'text-white/40 bg-white/10'
                      }`}
                      style={{
                        left: '50%',
                        top: '0px',
                        transform: 'translate(-50%, -50%)',
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      Going Live
                    </motion.div>
                  </motion.div>

                  <motion.div
                    onClick={() => showWorkPanel('solution')}
                    className={`absolute rounded-full border-2 cursor-pointer transition-all duration-500 ${
                      activeWorkPanel === 'solution'
                        ? 'border-[#A855F7]/50'
                        : 'border-white/12 hover:border-white/35'
                    }`}
                    style={{
                      width: '310px',
                      height: '310px',
                      top: '70px',
                      left: '70px',
                      background: activeWorkPanel === 'solution'
                        ? 'rgba(168, 85, 247, 0.05)'
                        : 'radial-gradient(circle at center, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    }}
                    animate={{
                      y: activeWorkPanel === 'solution' ? -8 : 0,
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <motion.div
                      className={`absolute text-xs font-semibold tracking-widest uppercase transition-all duration-500 px-3 py-1 rounded-full z-10 ${
                        activeWorkPanel === 'solution'
                          ? 'text-[#A855F7] bg-white/90'
                          : 'text-white/40 bg-white/10'
                      }`}
                      style={{
                        left: '50%',
                        top: '2px',
                        transform: 'translate(-50%, -50%)',
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      Custom Solution
                    </motion.div>
                  </motion.div>

                  <motion.div
                    onClick={() => showWorkPanel('pain')}
                    className={`absolute rounded-full border-2 cursor-pointer transition-all duration-500 ${
                      activeWorkPanel === 'pain'
                        ? 'border-[#E8B84A]/50'
                        : 'border-white/12 hover:border-white/35'
                    }`}
                    style={{
                      width: '170px',
                      height: '170px',
                      top: '140px',
                      left: '140px',
                      background: activeWorkPanel === 'pain'
                        ? 'rgba(232, 184, 74, 0.1)'
                        : 'radial-gradient(circle at center, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
                    }}
                    animate={{
                      y: activeWorkPanel === 'pain' ? -8 : 0,
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <motion.div
                      className={`absolute text-xs font-semibold tracking-widest uppercase transition-all duration-500 px-3 py-1 rounded-full z-10 whitespace-nowrap ${
                        activeWorkPanel === 'pain'
                          ? 'text-[#E8B84A] bg-white/90'
                          : 'text-white/40 bg-white/10'
                      }`}
                      style={{
                        left: '48%',
                        top: '2px',
                        transform: 'translate(-50%, -50%)',
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      Pain Points
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="relative min-h-52 lg:min-h-72 text-center lg:text-left">
              <AnimatePresence mode="wait">
                {!activeWorkPanel && (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-white mb-4 leading-tight tracking-tight">
                      Three steps to <em className="italic text-[#E8B84A]">operational freedom</em>
                    </h3>
                    <p className="text-base md:text-lg text-white/70 font-light leading-relaxed mb-4">
                      From diagnosis to deployment, we move fast and build solutions that fit how your business actually runs.
                    </p>
                    <span className="text-xs md:text-sm text-white/40 font-normal tracking-wider">
                      Click a circle to explore each step →
                    </span>
                  </motion.div>
                )}

                {activeWorkPanel === 'pain' && (
                  <motion.div
                    key="pain"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="inline-block px-4 py-1 rounded-full bg-[#E8B84A]/10 mb-6">
                      <span className="text-xs font-semibold tracking-widest text-[#E8B84A] uppercase">Step 1</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-white mb-4 leading-tight tracking-tight">
                      You tell us what's <em className="italic text-[#E8B84A]">slowing you down</em>
                    </h3>
                    <p className="text-base md:text-lg text-white/70 font-light leading-relaxed">
                      We dig into your workflows, team structure, and the bottlenecks quietly eating your time. No surface-level audits — we go deep.
                    </p>
                    <button
                      onClick={resetWorkPanel}
                      className="mt-6 text-sm font-medium text-[#E8B84A] hover:opacity-70 transition-opacity"
                    >
                      ← Back
                    </button>
                  </motion.div>
                )}

                {activeWorkPanel === 'solution' && (
                  <motion.div
                    key="solution"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="inline-block px-4 py-1 rounded-full bg-[#A855F7]/10 mb-6">
                      <span className="text-xs font-semibold tracking-widest text-[#A855F7] uppercase">Step 2</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-white mb-4 leading-tight tracking-tight">
                      We build around <em className="italic text-[#A855F7]">how you actually run</em>
                    </h3>
                    <p className="text-base md:text-lg text-white/70 font-light leading-relaxed">
                      No off-the-shelf platform. We design and deploy an AI agent tailored to your real operations — not a generic tool you'll need to bend around.
                    </p>
                    <button
                      onClick={resetWorkPanel}
                      className="mt-6 text-sm font-medium text-[#A855F7] hover:opacity-70 transition-opacity"
                    >
                      ← Back
                    </button>
                  </motion.div>
                )}

                {activeWorkPanel === 'live' && (
                  <motion.div
                    key="live"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="inline-block px-4 py-1 rounded-full bg-[#06B6D4]/10 mb-6">
                      <span className="text-xs font-semibold tracking-widest text-[#06B6D4] uppercase">Step 3</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-white mb-4 leading-tight tracking-tight">
                      You're <em className="italic text-[#06B6D4]">live in weeks</em>
                    </h3>
                    <p className="text-base md:text-lg text-white/70 font-light leading-relaxed">
                      Your agent is running, your team is freed up, and we keep iterating as your business evolves. No six-month timelines — just results.
                    </p>
                    <button
                      onClick={resetWorkPanel}
                      className="mt-6 text-sm font-medium text-[#06B6D4] hover:opacity-70 transition-opacity"
                    >
                      ← Back
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-32 px-6 md:px-10 lg:px-16 relative overflow-hidden min-h-screen flex items-center" data-snap>
        <div className="max-w-4xl mx-auto relative z-10 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {[
              {
                label: 'Vision',
                text: 'A future where businesses of any size can act with the intelligence, intent, and speed once reserved for the few.',
              },
              {
                label: 'Mission',
                text: "To help growing businesses grow faster and operate smarter — by making tomorrow's technologies accessible today.",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="p-8 md:p-12 rounded-3xl border border-white/8 bg-white/3 backdrop-blur-xl hover:bg-white/5 transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
              >
                <div className="text-xs font-semibold tracking-widest text-[#E8B84A] uppercase mb-6">{item.label}</div>
                <h3 className="text-2xl font-light text-white leading-relaxed">{item.text}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="cta" className="relative z-10 py-16 md:py-28 px-6 min-h-screen flex items-center" data-snap>
        <div className="max-w-4xl mx-auto text-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-3xl md:text-5xl font-light text-white mb-5">
              Ready to <em className="not-italic font-semibold" style={{ color: '#E8B84A' }}>level the playing field?</em>
            </h3>
            <p className="text-lg text-white/45 mb-10">
              Join the waitlist to be the first to know when we launch.
            </p>
            <motion.form
              className="max-w-md mx-auto flex flex-col sm:flex-row items-center gap-4 justify-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <input
                type="email"
                placeholder="you@company.com"
                className="w-full px-5 py-3 rounded-full bg-white/5 border border-white/20 text-white placeholder:text-white/40 outline-none text-base focus:border-[#E8B84A] focus:ring-2 focus:ring-[#E8B84A]/20 transition-all"
                aria-label="Email address"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold px-9 py-4 rounded-full text-base whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, #E8B84A, #E8A87C)',
                  color: '#2D1B4E',
                  boxShadow: '0 0 40px rgba(232,184,74,0.4)',
                }}
              >
                Join Waitlist
              </motion.button>
            </motion.form>
          </motion.div>
        </div>
      </section>

      <Footer />
      <Chatbot />
    </div>
  );
}
