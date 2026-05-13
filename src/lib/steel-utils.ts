/**
 * Steel Weight Calculation Utilities
 */

/**
 * TMT Bar Weight Calculation
 * Formula: D^2 / 162
 * @param diameter Diameter in mm
 * @returns Weight per meter in Kg
 */
export const calculateTMTWeightPerMeter = (diameter: number): number => {
    return (diameter * diameter) / 162;
};

/**
 * Plate Weight Calculation
 * Formula: L * W * T * 7.85 / 10^6 (if mm)
 * @param length Length in mm
 * @param width Width in mm
 * @param thickness Thickness in mm
 * @returns Total weight in Kg
 */
export const calculatePlateWeight = (length: number, width: number, thickness: number): number => {
    return (length * width * thickness * 7.85) / 1000000;
};

/**
 * Pipe Weight Calculation
 * Formula: (OD - WT) * WT * 0.02466
 * @param outerDiameter Outer Diameter in mm
 * @param wallThickness Wall Thickness in mm
 * @returns Weight per meter in Kg
 */
export const calculatePipeWeightPerMeter = (outerDiameter: number, wallThickness: number): number => {
    return (outerDiameter - wallThickness) * wallThickness * 0.02466;
};

/**
 * MS Angle/Channel/Beam Weight Calculation (Generic approach if dimensions given)
 * Usually these are looked up from sectional weight charts, but we can provide 
 * a reference or basic calc if volume known.
 */

export const calculateVolumeWeight = (volumeMm3: number): number => {
    return (volumeMm3 * 7.85) / 1000000;
};
