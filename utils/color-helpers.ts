import { SchedulerConfig } from '@/interfaces/scheduler-config';
import { Appointment } from '@/interfaces/api/models';

/**
 * Gets the border and background colors for scheduler items based on configuration
 * @param appointment The appointment data
 * @param config The scheduler configuration
 * @param mappings The color mapping object
 * @returns An object with border and background colors
 */
export const getSchedulerItemColors = (
  appointment: Appointment, 
  config: SchedulerConfig, 
  mappings: Record<string, string>
) => {
  // Get the raw color from the appointment based on config
  let rawColor: string | null = null;

  if (config.colorCodingType === 'status') {
    // Use status color if available
    const statusColor = (appointment as any).JobCardStatusColour;
    if (statusColor) {
      rawColor = statusColor;
    }
    // If status color is not available but we're in status mode, fall back to employee color
    else if (appointment.Employees && appointment.Employees.length > 0 && appointment.Employees[0].DisplayColor) {
      rawColor = appointment.Employees[0].DisplayColor;
    }
  } else if (config.colorCodingType === 'employee') {
    // Use employee color if available
    if (appointment.Employees && appointment.Employees.length > 0 && appointment.Employees[0].DisplayColor) {
      rawColor = appointment.Employees[0].DisplayColor;
    }
    // If employee color is not available but we're in employee mode, fall back to status color
    else {
      const statusColor = (appointment as any).JobCardStatusColour;
      if (statusColor) {
        rawColor = statusColor;
      }
    }
  }
  
  // Parse the color using the same approach as parsedColour in EmployeeAvatar
  const parsedColor = !rawColor 
    ? 'var(--mantine-color-scBlue-7)' 
    : (rawColor as string).startsWith('#') 
      ? rawColor 
      : mappings[rawColor] || 'var(--mantine-color-scBlue-7)';
  
  // Create a lighter version of the color
  let background;
  
  if (parsedColor.startsWith('var(--mantine-color-')) {
    // For CSS variables, extract the color family and use a lighter shade
    const match = parsedColor.match(/--mantine-color-([a-zA-Z]+)-([0-9])/);
    if (match) {
      const colorFamily = match[1];
      background = `var(--mantine-color-${colorFamily}-1)`;
    } else {
      background = 'var(--mantine-color-gray-1)'; // Fallback
    }
  } else if (parsedColor.startsWith('#')) {
    // For hex colors, use the theme's lighten function to create a lighter version
    try {
      // Convert hex to rgba with 0.15 opacity for a light background
      const r = parseInt(parsedColor.slice(1, 3), 16);
      const g = parseInt(parsedColor.slice(3, 5), 16);
      const b = parseInt(parsedColor.slice(5, 7), 16);
      background = `rgba(${r}, ${g}, ${b}, 0.15)`;
    } catch (e) {
      background = 'var(--mantine-color-gray-1)'; // Fallback
    }
  } else {
    background = 'var(--mantine-color-gray-1)'; // Fallback
  }
  
  return {
    border: parsedColor,
    background: background
  };
};