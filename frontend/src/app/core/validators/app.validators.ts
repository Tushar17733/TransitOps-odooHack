import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

/** Rejects strings that are empty or whitespace-only */
export function noWhitespace(): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null =>
    typeof c.value === 'string' && c.value.trim().length === 0 ? { whitespace: true } : null;
}

/** Validates exactly 10 numeric digits */
export function phoneNumber(): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const v = String(c.value ?? '').trim();
    return v && !/^[0-9]{10}$/.test(v) ? { phone: true } : null;
  };
}

/** Uppercase alphanumeric + hyphens, 2–20 chars */
export function registrationNumber(): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const v = String(c.value ?? '').trim();
    return v && !/^[A-Z0-9\-]{2,20}$/.test(v) ? { regNumber: true } : null;
  };
}

/** Uppercase alphanumeric + hyphens, 5–20 chars */
export function licenseNumber(): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const v = String(c.value ?? '').trim();
    return v && !/^[A-Z0-9\-]{5,20}$/.test(v) ? { licenseNum: true } : null;
  };
}

/** min(n) only when the field has a value — does not trigger on empty optional fields */
export function minIfPresent(min: number): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const v = c.value;
    if (v === null || v === undefined || v === '') return null;
    return +v >= min ? null : { min: { min, actual: v } };
  };
}

/** max(n) only when the field has a value */
export function maxIfPresent(max: number): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const v = c.value;
    if (v === null || v === undefined || v === '') return null;
    return +v <= max ? null : { max: { max, actual: v } };
  };
}
