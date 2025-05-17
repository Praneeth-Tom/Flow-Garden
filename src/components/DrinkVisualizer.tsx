
'use client';

import { DRINK_TYPES, getDrinkColor } from '@/types';
import React from 'react';

interface DrinkVisualizerProps {
  drinkType: string;
  currentAmount: number; // The amount from the input field
}

// This amount determines what is considered 100% full for the visual.
// Amounts larger than this will still show as 100% full.
const VISUAL_MAX_REFERENCE_AMOUNT = 500; 

const GlassVisual = ({ fillPercent, color }: { fillPercent: number; color: string }) => (
  <svg width="60" height="90" viewBox="0 0 60 90" className="mx-auto my-2 drop-shadow-sm" aria-hidden="true">
    <defs>
      <clipPath id="dynamicGlassClip">
        <path d="M10 88 L15 12 H45 L50 88 Z" />
      </clipPath>
    </defs>
    <path d="M10 88 L15 12 H45 L50 88 Z" stroke="currentColor" strokeWidth="1.5" fill="hsla(var(--foreground), 0.05)" />
    {fillPercent > 0 && (
      <rect
        x="10" // Covers the base of the clip path horizontally
        y={12 + (76 * (100 - fillPercent) / 100)} // 12 is top y of clip, 76 is height (88-12)
        width="40" // Covers the width of the clip path (45-15 at top, 50-10 at bottom)
        height={(76 * fillPercent) / 100}
        fill={color}
        clipPath="url(#dynamicGlassClip)"
        style={{ transition: 'y 0.2s ease-out, height 0.2s ease-out' }}
      />
    )}
  </svg>
);

const MugVisual = ({ fillPercent, color }: { fillPercent: number; color: string }) => (
  <svg width="70" height="70" viewBox="0 0 70 70" className="mx-auto my-2 drop-shadow-sm" aria-hidden="true">
    <defs>
      <clipPath id="dynamicMugClip">
        <rect x="5" y="10" width="45" height="45" rx="3" />
      </clipPath>
    </defs>
    <rect x="5" y="10" width="45" height="45" rx="3" stroke="currentColor" strokeWidth="1.5" fill="hsla(var(--foreground), 0.05)" />
    <path d="M50 20 Q60 25 60 32.5 Q60 40 50 45" stroke="currentColor" strokeWidth="1.5" fill="none" />
    {fillPercent > 0 && (
      <rect
        x="5"
        y={10 + (45 * (100 - fillPercent) / 100)} // 10 is top y, 45 is height
        width="45"
        height={(45 * fillPercent) / 100}
        fill={color}
        clipPath="url(#dynamicMugClip)"
        style={{ transition: 'y 0.2s ease-out, height 0.2s ease-out' }}
      />
    )}
  </svg>
);

const WineGlassVisual = ({ fillPercent, color }: { fillPercent: number; color: string }) => {
  // Bowl dimensions: top y=10, bottom y=60 (height=50), mid x=30, top width=40 (10 to 50)
  const bowlHeight = 50;
  const liquidHeight = (bowlHeight * fillPercent) / 100;
  const yFillStart = 10 + (bowlHeight - liquidHeight);
  
  // Calculate width at yFillStart (linear interpolation for simplicity for V shape)
  // Max width at y=10 is 40 (from x=10 to x=50). Min width at y=60 is 0.
  // This is an approximation for a V-shape fill within a curved glass.
  const fillTopWidth = 40 * (liquidHeight / bowlHeight);
  const xFillStart = 30 - fillTopWidth / 2;


  return (
    <svg width="60" height="90" viewBox="0 0 60 90" className="mx-auto my-2 drop-shadow-sm" aria-hidden="true">
      <defs>
        <clipPath id="dynamicWineClip">
           {/* Approximate bowl shape for clipping */}
          <path d="M10 40 C10 10, 50 10, 50 40 L45 80 L15 80 Z" />
        </clipPath>
      </defs>
      <path d="M30 80 L30 88 M20 88 H40" stroke="currentColor" strokeWidth="1.5" fill="none" /> {/* Stem and Base */}
      <path d="M10 40 C10 10, 50 10, 50 40 L45 80 L15 80 Z" stroke="currentColor" strokeWidth="1.5" fill="hsla(var(--foreground), 0.05)" /> {/* Bowl */}
      
      {fillPercent > 0 && (
         <rect
          x={15} // Average x position for the fill base
          y={10 + (70 * (100 - fillPercent) / 100)} // 70 is approx fillable height of bowl (80-10)
          width={30} // Average width of fill
          height={(70 * fillPercent) / 100}
          fill={color}
          clipPath="url(#dynamicWineClip)"
          style={{ transition: 'y 0.2s ease-out, height 0.2s ease-out' }}
        />
      )}
    </svg>
  );
};


export function DrinkVisualizer({ drinkType, currentAmount }: DrinkVisualizerProps) {
  const drinkInfo = DRINK_TYPES.find(dt => dt.name === drinkType);
  if (!drinkInfo) return <div className="h-[90px] w-[70px] mx-auto my-2"></div>; // Placeholder size

  const sanitizedAmount = Math.max(0, currentAmount); // Ensure amount is not negative
  const fillPercent = Math.min((sanitizedAmount / VISUAL_MAX_REFERENCE_AMOUNT) * 100, 100);
  const color = getDrinkColor(drinkType);

  let VisualComponent;
  switch (drinkType) {
    case 'Water':
    case 'Juice':
    case 'Milk':
      VisualComponent = GlassVisual;
      break;
    case 'Coffee':
    case 'Tea':
      VisualComponent = MugVisual;
      break;
    case 'Alcohol':
      VisualComponent = WineGlassVisual;
      break;
    default:
      VisualComponent = GlassVisual; 
  }

  return <VisualComponent fillPercent={fillPercent} color={color} />;
}
