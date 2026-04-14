import React from "react";
import {Badge, BadgeProps, BoxProps} from "@mantine/core";
import * as Enums from "@/utils/enums";

// Props type for the component
interface StatusProps extends BadgeProps, BoxProps {
  value: number; // Numeric value of the status
  statusEnum: { [key: string]: number }; // The enum object for status
  statusColors: { [key: number]: string }; // The enum object for colors
  minWidth?: string | number; // Minimum width of the badge
}

// The Status component
const Status: React.FC<StatusProps> = ({ value, statusEnum, statusColors, minWidth, ...badgeProps }) => {
  // Reverse lookup to get the status label by its value
  const statusLabel = Enums.getEnumStringValue(statusEnum, value, true);

  // Find the color for the given value
  const color = statusColors?.[value] || 'gray';

  return (
    <Badge miw={minWidth} color={color} variant="filled" p={'sm'} radius={4} {...badgeProps}>
      {statusLabel ?? "Unknown"}
    </Badge>
  );
};

export default Status;