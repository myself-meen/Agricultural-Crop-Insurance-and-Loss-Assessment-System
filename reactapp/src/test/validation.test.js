import { describe, it, expect } from 'vitest';

export const validators = {
  isValidAadhaar: (val) => /^\d{12}$/.test(val),
  isValidIfsc: (val) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(val),
  isValidPhone: (val) => /^[6-9]\d{9}$/.test(val),
  isValidEmail: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
  isValidName: (val) => /^[a-zA-Z\s]{3,50}$/.test(val),
};

describe('Frontend Form Validators', () => {
  it('should strictly validate 12-digit Aadhaar numbers', () => {
    expect(validators.isValidAadhaar('123456789012')).toBe(true);
    expect(validators.isValidAadhaar('12345678901')).toBe(false); // 11 digits
    expect(validators.isValidAadhaar('1234567890123')).toBe(false); // 13 digits
    expect(validators.isValidAadhaar('12345678901a')).toBe(false); // non-digit
  });

  it('should validate RBI IFSC code format', () => {
    expect(validators.isValidIfsc('SBIN0001234')).toBe(true);
    expect(validators.isValidIfsc('HDFC0000001')).toBe(true);
    expect(validators.isValidIfsc('sbin0001234')).toBe(false); // lowercase
    expect(validators.isValidIfsc('SBI00001234')).toBe(false);  // only 3 alpha chars
    expect(validators.isValidIfsc('SBIN1001234')).toBe(false);  // 5th char must be 0
  });

  it('should validate 10-digit Indian mobile numbers starting with 6-9', () => {
    expect(validators.isValidPhone('9876543210')).toBe(true);
    expect(validators.isValidPhone('8765432109')).toBe(true);
    expect(validators.isValidPhone('5876543210')).toBe(false); // starts with 5
    expect(validators.isValidPhone('987654321')).toBe(false);  // 9 digits
  });

  it('should validate standard email addresses', () => {
    expect(validators.isValidEmail('farmer@cropinsure.gov.in')).toBe(true);
    expect(validators.isValidEmail('ramesh@farmer.in')).toBe(true);
    expect(validators.isValidEmail('plainaddress')).toBe(false);
  });

  it('should validate alphabetic legal names', () => {
    expect(validators.isValidName('Ramesh Chandra')).toBe(true);
    expect(validators.isValidName('Dr Rajesh Kumar')).toBe(true);
    expect(validators.isValidName('Ramesh123')).toBe(false); // contains digits
  });
});
