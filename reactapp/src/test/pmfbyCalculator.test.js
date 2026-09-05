import { describe, it, expect } from 'vitest';

export function calculatePmfbyPremiums(sownAreaHa, sumInsuredPerHa, season) {
  const totalSumInsured = sownAreaHa * sumInsuredPerHa;
  let farmerRate = 0.02; // default Kharif
  if (season === 'RABI') farmerRate = 0.015;
  if (season === 'ZAID') farmerRate = 0.05;

  const actuarialRate = 0.10;
  const totalPremium = totalSumInsured * actuarialRate;
  const farmerPremium = totalSumInsured * farmerRate;
  const totalSubsidy = Math.max(0, totalPremium - farmerPremium);
  const centralSubsidy = totalSubsidy / 2;
  const stateSubsidy = totalSubsidy / 2;

  return {
    totalSumInsured,
    farmerPremium,
    centralSubsidy,
    stateSubsidy,
    totalSubsidy,
  };
}

describe('PMFBY Statutory Premium Calculator', () => {
  it('should calculate 2.0% farmer premium for Kharif crop', () => {
    const res = calculatePmfbyPremiums(2.0, 50000, 'KHARIF');
    expect(res.totalSumInsured).toBe(100000);
    expect(res.farmerPremium).toBe(2000); // 2% of 100,000
    expect(res.totalSubsidy).toBe(8000);  // 10% total premium (10,000) - 2,000
    expect(res.centralSubsidy).toBe(4000);
    expect(res.stateSubsidy).toBe(4000);
  });

  it('should calculate 1.5% farmer premium for Rabi crop', () => {
    const res = calculatePmfbyPremiums(4.0, 60000, 'RABI');
    expect(res.totalSumInsured).toBe(240000);
    expect(res.farmerPremium).toBe(3600); // 1.5% of 240,000
    expect(res.totalSubsidy).toBe(20400); // 10% (24,000) - 3,600
    expect(res.centralSubsidy).toBe(10200);
    expect(res.stateSubsidy).toBe(10200);
  });

  it('should calculate 5.0% farmer premium for Zaid/Commercial crop', () => {
    const res = calculatePmfbyPremiums(1.5, 80000, 'ZAID');
    expect(res.totalSumInsured).toBe(120000);
    expect(res.farmerPremium).toBe(6000); // 5% of 120,000
    expect(res.totalSubsidy).toBe(6000);  // 10% (12,000) - 6,000
    expect(res.centralSubsidy).toBe(3000);
    expect(res.stateSubsidy).toBe(3000);
  });
});
