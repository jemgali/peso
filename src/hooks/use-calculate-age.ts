"use client"

import { useMemo } from "react"

/**
 * Calculate age from a birthdate string.
 * 
 * @param birthdate - Date string in ISO format (YYYY-MM-DD) or Date object
 * @returns Calculated age in years, or null if date is invalid
 * 
 * @example
 * const age = useCalculateAge("1995-03-15")
 * // Returns current age based on today's date
 */
export function useCalculateAge(birthdate: string | Date | null | undefined): number | null {
  return useMemo(() => {
    if (!birthdate) return null

    const birth = typeof birthdate === "string" ? new Date(birthdate) : birthdate
    
    // Check for invalid date
    if (isNaN(birth.getTime())) return null

    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    // Adjust if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    // Return null for unreasonable ages
    if (age < 0 || age >= 150) return null

    return age
  }, [birthdate])
}

/**
 * Pure function to calculate age (for non-React contexts).
 * 
 * @param birthdate - Date string in ISO format (YYYY-MM-DD) or Date object
 * @returns Calculated age in years, or null if date is invalid
 */
export function calculateAge(birthdate: string | Date | null | undefined): number | null {
  if (!birthdate) return null

  const birth = typeof birthdate === "string" ? new Date(birthdate) : birthdate
  
  // Check for invalid date
  if (isNaN(birth.getTime())) return null

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  // Adjust if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  // Return null for unreasonable ages
  if (age < 0 || age >= 150) return null

  return age
}
