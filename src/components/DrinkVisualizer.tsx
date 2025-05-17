
'use client';

import { DRINK_TYPES, getDrinkColor } from '@/types';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Repeat } from 'lucide-react';

interface VisualProps {
  fillPercent: number;
  color: string;
}

interface DrinkVisualizerProps {
  drinkType: string;
  currentAmount: number; // The amount from the input field
}

const VISUAL_MAX_REFERENCE_AMOUNT = 500;

// Existing Visuals (some will be repurposed or renamed)
const GlassVisual = ({ fillPercent, color }: VisualProps) => (
  <svg width="60" height="90" viewBox="0 0 60 90" className="mx-auto my-1 drop-shadow-sm" aria-hidden="true">
    <defs>
      <clipPath id="dynamicGlassClip">
        {/* Path for a pint glass: wider at top, narrower at bottom */}
        <path d="M12 10 H48 L44 85 H16 Z" />
      </clipPath>
    </defs>
    {/* Pint glass outline */}
    <path d="M12 10 H48 L44 85 H16 Z" stroke="currentColor" strokeWidth="1.5" fill="hsla(var(--foreground), 0.05)" />
    {fillPercent > 0 && (
      <rect
        x="12" // Min x-coordinate of the path
        y={10 + (75 * (100 - fillPercent) / 100)} // Top y-coordinate + (fillable_height * (1 - fill_ratio))
        width="36" // Max width of the path (48-12)
        height={(75 * fillPercent) / 100} // fillable_height * fill_ratio (fillable_height = 85-10 = 75)
        fill={color}
        clipPath="url(#dynamicGlassClip)"
        style={{ transition: 'y 0.2s ease-out, height 0.2s ease-out' }}
      />
    )}
  </svg>
);

const CoffeeMugVisual = ({ fillPercent, color }: VisualProps) => ( // Renamed from MugVisual
  <svg width="70" height="70" viewBox="0 0 70 70" className="mx-auto my-1 drop-shadow-sm" aria-hidden="true">
    <defs>
      <clipPath id="dynamicCoffeeMugClip">
        <rect x="5" y="10" width="45" height="45" rx="3" />
      </clipPath>
    </defs>
    <rect x="5" y="10" width="45" height="45" rx="3" stroke="currentColor" strokeWidth="1.5" fill="hsla(var(--foreground), 0.05)" />
    <path d="M50 20 Q60 25 60 32.5 Q60 40 50 45" stroke="currentColor" strokeWidth="1.5" fill="none" /> {/* Handle */}
    {fillPercent > 0 && (
      <rect
        x="5"
        y={10 + (45 * (100 - fillPercent) / 100)}
        width="45"
        height={(45 * fillPercent) / 100}
        fill={color}
        clipPath="url(#dynamicCoffeeMugClip)"
        style={{ transition: 'y 0.2s ease-out, height 0.2s ease-out' }}
      />
    )}
  </svg>
);

// Updated WaterJugVisual
const WaterJugVisual = ({ fillPercent, color }: VisualProps) => (
  <svg width="70" height="90" viewBox="0 0 70 90" className="mx-auto my-1 drop-shadow-sm" aria-hidden="true" data-ai-hint="water jug">
    <defs>
      <clipPath id="dynamicJugClip">
        <path d="M30,10 H50 V15 C60,15 65,25 65,30 L65,75 C65,85 55,85 35,85 C15,85 5,85 5,75 L5,30 C5,25 10,15 30,15 Z" />
      </clipPath>
    </defs>
    <path d="M30,10 H50 V15 C60,15 65,25 65,30 L65,75 C65,85 55,85 35,85 C15,85 5,85 5,75 L5,30 C5,25 10,15 30,15 Z" stroke="currentColor" strokeWidth="1.5" fill="hsla(var(--foreground), 0.05)" />
    {fillPercent > 0 && (
      <rect
        x="5" // x-coordinate of the body
        y={30 + (45 * (100 - fillPercent) / 100)} // Fillable area from y=30 to y=75 (height 45)
        width="60" // Width of the body (65-5)
        height={(45 * fillPercent) / 100}
        fill={color}
        clipPath="url(#dynamicJugClip)"
        style={{ transition: 'y 0.2s ease-out, height 0.2s ease-out' }}
      />
    )}
  </svg>
);

const JuiceBottleVisual = ({ fillPercent, color }: VisualProps) => (
  <svg width="50" height="90" viewBox="0 0 50 90" className="mx-auto my-1 drop-shadow-sm" aria-hidden="true">
    <defs>
      <clipPath id="dynamicJuiceBottleClip">
        <path d="M15 88 L15 25 Q15 15 20 12 H30 Q35 15 35 25 L35 88 Z M18 10 H32 V5 H18 Z" /> {/* Bottle with cap */}
      </clipPath>
    </defs>
    <path d="M15 88 L15 25 Q15 15 20 12 H30 Q35 15 35 25 L35 88 Z" stroke="currentColor" strokeWidth="1.5" fill="hsla(var(--foreground), 0.05)" />
    <path d="M18 10 H32 V5 H18 Z" stroke="currentColor" strokeWidth="1.5" fill="hsla(var(--foreground), 0.05)" /> {/* Cap */}
    {fillPercent > 0 && (
      <rect // Fill for the main body part
        x="15" // x of the main body
        y={25 + ((88-25) * (100 - fillPercent) / 100)} // y starts at 25, height is 88-25 = 63
        width="20" // width is 35-15
        height={((88-25) * fillPercent) / 100}
        fill={color}
        clipPath="url(#dynamicJuiceBottleClip)"
        style={{ transition: 'y 0.2s ease-out, height 0.2s ease-out' }}
      />
    )}
  </svg>
);

const MilkCartonVisual = ({ fillPercent, color }: VisualProps) => (
  <svg width="60" height="90" viewBox="0 0 60 90" className="mx-auto my-1 drop-shadow-sm" aria-hidden="true">
    <defs>
      <clipPath id="dynamicMilkCartonClip">
        <path d="M10 85 L10 20 L30 10 L50 20 L50 85 Z M10 20 L30 30 L50 20 M30 10 L30 30" />
      </clipPath>
    </defs>
    <path d="M10 85 L10 20 L30 10 L50 20 L50 85 Z" stroke="currentColor" strokeWidth="1.5" fill="hsla(var(--foreground), 0.05)" />
    <path d="M10 20 L30 30 L50 20 M30 10 L30 30" stroke="currentColor" strokeWidth="1.5" fill="none" /> {/* Top folds */}
    {fillPercent > 0 && (
      <rect
        x="10"
        y={20 + ((85-20) * (100 - fillPercent) / 100)} // Approx fillable area from y=20 (base of roof) to y=85
        width="40" // Width 50-10
        height={((85-20) * fillPercent) / 100}
        fill={color}
        clipPath="url(#dynamicMilkCartonClip)"
        style={{ transition: 'y 0.2s ease-out, height 0.2s ease-out' }}
      />
    )}
  </svg>
);

const SmallCupVisual = ({ fillPercent, color }: VisualProps) => (
  <svg width="60" height="60" viewBox="0 0 60 60" className="mx-auto my-1 drop-shadow-sm" aria-hidden="true">
    <defs>
      <clipPath id="dynamicSmallCupClip">
        <path d="M10 50 Q10 30 20 25 H40 Q50 30 50 50 Z M20 25 Q20 10 30 10 Q40 10 40 25" /> {/* Cup with a slight curve at top opening */}
      </clipPath>
    </defs>
    <path d="M10 50 Q10 30 20 25 H40 Q50 30 50 50 Z" stroke="currentColor" strokeWidth="1.5" fill="hsla(var(--foreground), 0.05)" /> {/* Main body */}
    <path d="M50 35 C55 35 55 45 50 45" stroke="currentColor" strokeWidth="1.5" fill="none" /> {/* Small handle */}
    <path d="M20 25 Q20 10 30 10 Q40 10 40 25" stroke="currentColor" strokeWidth="1.5" fill="hsla(var(--foreground), 0.05)" /> {/* Top opening visual illusion */}

    {fillPercent > 0 && (
      <rect
        x="10" // x of the main body
        y={25 + ((50-25) * (100 - fillPercent) / 100)} // fill from y=25, height 50-25 = 25
        width="40" // width 50-10
        height={((50-25) * fillPercent) / 100}
        fill={color}
        clipPath="url(#dynamicSmallCupClip)"
        style={{ transition: 'y 0.2s ease-out, height 0.2s ease-out' }}
      />
    )}
  </svg>
);

const KettleVisual = ({ fillPercent, color }: VisualProps) => (
  <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto my-1 drop-shadow-sm" aria-hidden="true">
    <defs>
      <clipPath id="dynamicKettleClip">
        <path d="M15 70 A25 25 0 0 1 65 70 L60 30 A5 5 0 0 0 55 25 H25 A5 5 0 0 0 20 30 Z" />
      </clipPath>
    </defs>
    {/* Body */}
    <path d="M15 70 A25 25 0 0 1 65 70 L60 30 A5 5 0 0 0 55 25 H25 A5 5 0 0 0 20 30 Z" stroke="currentColor" strokeWidth="1.5" fill="hsla(var(--foreground), 0.05)" />
    {/* Handle */}
    <path d="M65 40 C75 35, 75 55, 65 60" stroke="currentColor" strokeWidth="1.5" fill="none" />
    {/* Spout */}
    <path d="M15 35 L5 30 Q10 25 15 25" stroke="currentColor" strokeWidth="1.5" fill="none" />
    {/* Lid */}
    <ellipse cx="40" cy="25" rx="16" ry="4" stroke="currentColor" strokeWidth="1.5" fill="hsla(var(--foreground), 0.1)" />
    <circle cx="40" cy="22" r="3" stroke="currentColor" strokeWidth="1.5" fill="hsla(var(--foreground), 0.2)" />

    {fillPercent > 0 && (
       <rect
        x="20" // x for fillable area
        y={30 + ((70-30) * (100 - fillPercent) / 100)} // fill from y=30 to y=70, height 40
        width="40" // approx width of body
        height={((70-30) * fillPercent) / 100}
        fill={color}
        clipPath="url(#dynamicKettleClip)"
        style={{ transition: 'y 0.2s ease-out, height 0.2s ease-out' }}
      />
    )}
  </svg>
);

const BeerMugVisual = ({ fillPercent, color }: VisualProps) => (
  <svg width="70" height="85" viewBox="0 0 70 85" className="mx-auto my-1 drop-shadow-sm" aria-hidden="true">
    <defs>
      <clipPath id="dynamicBeerMugClip">
        <path d="M15 80 L15 15 Q15 10 20 10 H50 Q55 10 55 15 L55 80 Z" />
      </clipPath>
    </defs>
    <path d="M15 80 L15 15 Q15 10 20 10 H50 Q55 10 55 15 L55 80 Z" stroke="currentColor" strokeWidth="1.5" fill="hsla(var(--foreground), 0.05)" /> {/* Mug Body */}
    <path d="M55 25 Q65 30 65 45 Q65 60 55 65" stroke="currentColor" strokeWidth="1.5" fill="none" /> {/* Handle */}
    {/* Optional: Foam lines if it's beer */}
    {fillPercent > 0 && (
      <rect
        x="15"
        y={10 + ((80-10) * (100 - fillPercent) / 100)} // Fill from y=10 to y=80, height 70
        width="40" // Width 55-15
        height={((80-10) * fillPercent) / 100}
        fill={color}
        clipPath="url(#dynamicBeerMugClip)"
        style={{ transition: 'y 0.2s ease-out, height 0.2s ease-out' }}
      />
    )}
  </svg>
);

const CocktailGlassVisual = ({ fillPercent, color }: VisualProps) => ( // Martini Style
  <svg width="70" height="90" viewBox="0 0 70 90" className="mx-auto my-1 drop-shadow-sm" aria-hidden="true">
    <defs>
      <clipPath id="dynamicCocktailClip">
        <path d="M5 15 L35 50 L65 15 Z" /> {/* Inverted cone for martini */}
      </clipPath>
    </defs>
    <path d="M5 15 L35 50 L65 15 Z" stroke="currentColor" strokeWidth="1.5" fill="hsla(var(--foreground), 0.05)" /> {/* Bowl */}
    <path d="M35 50 L35 80 M20 80 H50" stroke="currentColor" strokeWidth="1.5" fill="none" /> {/* Stem and Base */}
    {fillPercent > 0 && (
      <polygon // Using polygon for triangular fill might be easier
        points={`
          ${35 - (30 * fillPercent / 100)}, ${50 - (35 * fillPercent / 100)}
          ${35 + (30 * fillPercent / 100)}, ${50 - (35 * fillPercent / 100)}
          35, 50
        `}
        fill={color}
        clipPath="url(#dynamicCocktailClip)"
        style={{ transition: 'points 0.2s ease-out' }} // Transition for points is tricky, height/y on a rect is better.
                                                        // Reverting to rect with clip-path for consistency.
      />
    )}
     {fillPercent > 0 && ( // Rect fill for Martini glass
      <rect
        x={5} // x of the clip path
        y={15 + (35 * (100 - fillPercent) / 100)} // bowl top y=15, bowl height=35
        width={60} // width of the clip path
        height={(35 * fillPercent) / 100}
        fill={color}
        clipPath="url(#dynamicCocktailClip)"
        style={{ transition: 'y 0.2s ease-out, height 0.2s ease-out' }}
      />
    )}
  </svg>
);


const visualComponents: Record<string, React.FC<VisualProps>> = {
  'glass': GlassVisual,
  'jug': WaterJugVisual,
  'juice-bottle': JuiceBottleVisual,
  'milk-carton': MilkCartonVisual,
  'small-cup': SmallCupVisual,
  'coffee-mug': CoffeeMugVisual,
  'kettle': KettleVisual,
  'beer-mug': BeerMugVisual,
  'cocktail-glass': CocktailGlassVisual,
};

const initialVisualVariants = DRINK_TYPES.reduce((acc, drinkType) => {
  acc[drinkType.name] = 0;
  return acc;
}, {} as Record<string, number>);


export function DrinkVisualizer({ drinkType, currentAmount }: DrinkVisualizerProps) {
  const [currentVisualVariants, setCurrentVisualVariants] = useState<Record<string, number>>(initialVisualVariants);

  const drinkInfo = DRINK_TYPES.find(dt => dt.name === drinkType);
  if (!drinkInfo) return <div className="h-[90px] w-[70px] mx-auto my-1"></div>;

  const sanitizedAmount = Math.max(0, currentAmount);
  const fillPercent = Math.min((sanitizedAmount / VISUAL_MAX_REFERENCE_AMOUNT) * 100, 100);
  const color = getDrinkColor(drinkType);

  const currentVariantIndex = currentVisualVariants[drinkType] || 0;
  const visualIdentifier = drinkInfo.visuals[currentVariantIndex];
  const VisualComponent = visualComponents[visualIdentifier] || GlassVisual; // Fallback to GlassVisual

  const handleSwapVisual = () => {
    setCurrentVisualVariants(prev => ({
      ...prev,
      [drinkType]: (prev[drinkType] + 1) % drinkInfo.visuals.length,
    }));
  };
  
  // Reset variant when drinkType changes, if you want each drink to remember its own last choice, remove this.
  // For now, let's keep it simple: it remembers. If you want it to reset to 0 on drinkType change:
  // useEffect(() => {
  //  setCurrentVisualVariants(prev => ({ ...prev, [drinkType]: 0 }));
  // }, [drinkType]);


  return (
    <div className="flex flex-col items-center">
      <VisualComponent fillPercent={fillPercent} color={color} />
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleSwapVisual} 
        className="mt-1 h-8 px-3"
        aria-label={`Swap ${drinkType} container visual`}
      >
        <Repeat className="mr-1.5 h-3.5 w-3.5" /> Swap
      </Button>
    </div>
  );
}

