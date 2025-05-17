
'use client';

import { DRINK_TYPES, getDrinkColor } from '@/types';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Repeat } from 'lucide-react';
import { useTheme } from 'next-themes'; // Import useTheme

interface VisualProps {
  fillPercent: number;
  color: string;
}

interface DrinkVisualizerProps {
  drinkType: string;
  currentAmount: number; // The amount from the input field
}

const VISUAL_MAX_REFERENCE_AMOUNT = 500;
const CONTAINER_BASE_FILL_VAR = "hsl(var(--container-base-fill))";

const GlassVisual = ({ fillPercent, color }: VisualProps) => (
  <svg width="60" height="90" viewBox="0 0 60 90" className="mx-auto my-1 drop-shadow-sm" aria-hidden="true">
    <defs>
      <clipPath id="dynamicGlassClip">
        <path d="M12 10 H48 L44 85 H16 Z" />
      </clipPath>
    </defs>
    <path d="M12 10 H48 L44 85 H16 Z" fill={CONTAINER_BASE_FILL_VAR} />
    {fillPercent > 0 && (
      <rect
        x="12"
        y={10 + (75 * (100 - fillPercent) / 100)}
        width="36"
        height={(75 * fillPercent) / 100}
        fill={color}
        clipPath="url(#dynamicGlassClip)"
        style={{ transition: 'y 0.2s ease-out, height 0.2s ease-out' }}
      />
    )}
  </svg>
);

const CoffeeMugVisual = ({ fillPercent, color }: VisualProps) => ( 
  <svg width="70" height="70" viewBox="0 0 70 70" className="mx-auto my-1 drop-shadow-sm" aria-hidden="true">
    <defs>
      <clipPath id="dynamicCoffeeMugClip">
        <rect x="5" y="10" width="45" height="45" rx="3" />
      </clipPath>
    </defs>
    <rect x="5" y="10" width="45" height="45" rx="3" fill={CONTAINER_BASE_FILL_VAR} />
    <path d="M50 20 Q60 25 60 32.5 Q60 40 50 45" fill={CONTAINER_BASE_FILL_VAR} />
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

const WaterJugVisual = ({ fillPercent, color }: VisualProps) => (
  <svg width="70" height="90" viewBox="0 0 70 90" className="mx-auto my-1 drop-shadow-sm" aria-hidden="true" data-ai-hint="water dispenser">
    <defs>
      <clipPath id="dynamicJugClip">
        {/* Centered opening part of the path, integrated into main shape */}
        <path d="M20 10 H50 Q55 10 55 15 V20 H15 V15 Q15 10 20 10 Z M15 20 L15 75 C15 85 25 85 35 85 C45 85 55 85 55 75 L55 20 Z" />
      </clipPath>
    </defs>
    {/* Main body path - ensures centered opening */}
    <path d="M20 10 H50 Q55 10 55 15 V20 H15 V15 Q15 10 20 10 Z M15 20 L15 75 C15 85 25 85 35 85 C45 85 55 85 55 75 L55 20 Z" fill={CONTAINER_BASE_FILL_VAR} />
    {fillPercent > 0 && (
      <rect
        x="15" // x of the main body for filling
        y={20 + ((75-20) * (100 - fillPercent) / 100)} // Fillable area from y=20, height is 75-20 = 55
        width="40" // Width of the main body 55-15
        height={((75-20) * fillPercent) / 100}
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
        <path d="M15 88 L15 25 Q15 15 20 12 H30 Q35 15 35 25 L35 88 Z M18 10 H32 V5 H18 Z" />
      </clipPath>
    </defs>
    <path d="M15 88 L15 25 Q15 15 20 12 H30 Q35 15 35 25 L35 88 Z" fill={CONTAINER_BASE_FILL_VAR} />
    <path d="M18 10 H32 V5 H18 Z" fill={CONTAINER_BASE_FILL_VAR} />
    {fillPercent > 0 && (
      <rect
        x="15"
        y={25 + ((88-25) * (100 - fillPercent) / 100)}
        width="20"
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
        <path d="M10 85 L10 20 L30 10 L50 20 L50 85 Z" />
      </clipPath>
    </defs>
    <path d="M10 85 L10 20 L30 10 L50 20 L50 85 Z" fill={CONTAINER_BASE_FILL_VAR} />
    {fillPercent > 0 && (
      <rect
        x="10"
        y={20 + ((85-20) * (100 - fillPercent) / 100)}
        width="40"
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
        <path d="M10 50 Q10 30 20 25 H40 Q50 30 50 50 Z M20 25 Q20 10 30 10 Q40 10 40 25" /> 
      </clipPath>
    </defs>
    <path d="M10 50 Q10 30 20 25 H40 Q50 30 50 50 Z" fill={CONTAINER_BASE_FILL_VAR} />
    <path d="M50 35 C55 35 55 45 50 45" fill={CONTAINER_BASE_FILL_VAR} />
    <path d="M20 25 Q20 10 30 10 Q40 10 40 25" fill={CONTAINER_BASE_FILL_VAR} />
    {fillPercent > 0 && (
      <rect
        x="10"
        y={25 + ((50-25) * (100 - fillPercent) / 100)}
        width="40"
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
    <path d="M15 70 A25 25 0 0 1 65 70 L60 30 A5 5 0 0 0 55 25 H25 A5 5 0 0 0 20 30 Z" fill={CONTAINER_BASE_FILL_VAR} />
    <path d="M65 40 C75 35, 75 55, 65 60" fill={CONTAINER_BASE_FILL_VAR} />
    <path d="M15 35 L5 30 Q10 25 15 25" fill={CONTAINER_BASE_FILL_VAR} />
    <ellipse cx="40" cy="25" rx="16" ry="4" fill={CONTAINER_BASE_FILL_VAR} />
    <circle cx="40" cy="22" r="3" fill={CONTAINER_BASE_FILL_VAR} />
    {fillPercent > 0 && (
       <rect
        x="20"
        y={30 + ((70-30) * (100 - fillPercent) / 100)}
        width="40"
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
    <path d="M15 80 L15 15 Q15 10 20 10 H50 Q55 10 55 15 L55 80 Z" fill={CONTAINER_BASE_FILL_VAR} />
    <path d="M55 25 Q65 30 65 45 Q65 60 55 65" fill={CONTAINER_BASE_FILL_VAR} />
    {fillPercent > 0 && (
      <rect
        x="15"
        y={10 + ((80-10) * (100 - fillPercent) / 100)}
        width="40"
        height={((80-10) * fillPercent) / 100}
        fill={color}
        clipPath="url(#dynamicBeerMugClip)"
        style={{ transition: 'y 0.2s ease-out, height 0.2s ease-out' }}
      />
    )}
  </svg>
);

const CocktailGlassVisual = ({ fillPercent, color }: VisualProps) => (
  <svg width="70" height="90" viewBox="0 0 70 90" className="mx-auto my-1 drop-shadow-sm" aria-hidden="true">
    <defs>
      <clipPath id="dynamicCocktailClip">
        <path d="M5 15 L35 50 L65 15 Z" />
      </clipPath>
    </defs>
    <path d="M5 15 L35 50 L65 15 Z" fill={CONTAINER_BASE_FILL_VAR} />
    <path d="M35 50 L35 80 M20 80 H50" fill={CONTAINER_BASE_FILL_VAR} />
     {fillPercent > 0 && (
      <rect
        x={5}
        y={15 + (35 * (100 - fillPercent) / 100)}
        width={60}
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
  const { resolvedTheme } = useTheme(); // Get the resolved theme ('light' or 'dark')
  const [currentVisualVariants, setCurrentVisualVariants] = useState<Record<string, number>>(initialVisualVariants);

  const drinkInfo = DRINK_TYPES.find(dt => dt.name === drinkType);
  if (!drinkInfo) return <div className="h-[90px] w-[70px] mx-auto my-1"></div>;

  const sanitizedAmount = Math.max(0, currentAmount);
  const fillPercent = Math.min((sanitizedAmount / VISUAL_MAX_REFERENCE_AMOUNT) * 100, 100);
  const color = getDrinkColor(drinkType);

  const currentVariantIndex = currentVisualVariants[drinkType] || 0;
  const visualIdentifier = drinkInfo.visuals[currentVariantIndex];
  const VisualComponent = visualComponents[visualIdentifier] || GlassVisual;

  const handleSwapVisual = () => {
    setCurrentVisualVariants(prev => ({
      ...prev,
      [drinkType]: (prev[drinkType] + 1) % drinkInfo.visuals.length,
    }));
  };
  
  return (
    <div className="flex flex-col items-center">
      {/* Add key={resolvedTheme} to force re-mount on theme change */}
      <VisualComponent fillPercent={fillPercent} color={color} key={resolvedTheme} />
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
