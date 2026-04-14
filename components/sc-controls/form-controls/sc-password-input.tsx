import React, { FC, useEffect, useMemo, useState } from 'react';
import {Box, Group, PasswordInput, PasswordInputProps, Popover, Text, useMantineTheme} from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import Helper from '@/utils/helper';

export type SCPasswordInputProps = PasswordInputProps & {
  userwords?: string[];
  // When false, do not show the strength/help popover (useful for existing/current password fields)
  showPopover?: boolean;
};

// A reusable password input with built-in popover hints using the global Helper.getPasswordStrengthError
// - Spreads standard Mantine PasswordInput props
// - Shows requirements when focused
// - Accepts optional `userwords` to strengthen validation hints for personal info
const SCPasswordInput: FC<SCPasswordInputProps> = (props) => {
  const theme = useMantineTheme();
  const { userwords, showPopover = true, onChange, value, onFocus, onBlur, ...rest } = props as any;

  const [opened, setOpened] = useState(false);
  const [internalValue, setInternalValue] = useState<string>((value ?? '') as string);

  useEffect(() => {
    // keep local state in sync if parent controls value
    if (value !== undefined && value !== internalValue) {
      setInternalValue(value as string);
    }
  }, [value]);

  const rules = useMemo(() => {
    const pwd = (internalValue || '').toString();
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const noSpaces = !(/\s/.test(pwd));
    const minLen = pwd.length >= 10; // global min length

    // Reuse helper for overall error; consider userwords for extra guidance
    const strengthError = Helper.getPasswordStrengthError(pwd, { userwords, skipBaseChecks: true });
    const baseError = Helper.getPasswordStrengthError(pwd, { userwords });
    // Actively tie the sensitive/personal check to validator outcome, but also pre-detect hits for early feedback
    /*const sensitiveHits = Helper.getPasswordSensitiveKeywordHits ? Helper.getPasswordSensitiveKeywordHits(pwd, { userwords }) : [];
    const hasSensitiveByHits = (sensitiveHits?.length ?? 0) > 0;
    const hasSensitiveByValidator = strengthError === 'Contains personal or sensitive keywords';
    const noSensitive = !(hasSensitiveByHits || hasSensitiveByValidator);*/

    const passesAll = !strengthError;

    return {
      minLen,
      hasUpper,
      hasLower,
      hasNumber,
      noSpaces,
      // noSensitive,
      passesAll,
      strengthError,
        baseError
    };
  }, [internalValue, userwords]);

  const hintItem = (passed: boolean, label: string) => (
    <Group gap={6} wrap="nowrap">
      {passed ? (
        <IconCheck color={theme.colors.scBlue ? theme.colors.scBlue[7] : theme.colors.blue[6]} size={16} />
      ) : (
        <IconX color={theme.colors.yellow[7]} size={16} />
      )}
      <Text size="sm" c="dimmed">{label}</Text>
    </Group>
  );

  const handleFocus = (e) => {
    if (showPopover) setOpened(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e) => {
    // small timeout to allow click within popover if needed
    if (showPopover) setTimeout(() => setOpened(false), 100);
    onBlur && onBlur(e);
  };

  const handleChange = (e) => {
    const v = e.currentTarget.value;
    setInternalValue(v);
    // Keep SCInput-style contract for existing handlers: { name, value }
    if (typeof onChange === 'function') {
      try {
        onChange({ ...e, target: e.currentTarget, name: rest?.name, value: v });
      } catch {
        // fallback to raw mantine event
        onChange(e);
      }
    }
  };

  if (!showPopover) {
    return (
      <PasswordInput
        {...(rest as PasswordInputProps)}
        value={internalValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        minLength={10}
        maxLength={100}
        mt={'sm'}
      />
    );
  }

  return (
    <Popover opened={opened} position="right" offset={{crossAxis: 0, mainAxis: 20}} trapFocus={false}>
      <Popover.Target>
          <PasswordInput
            {...(rest as PasswordInputProps)}
            value={internalValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            // Ensure minimum and maximum length attributes help browsers too
            minLength={10}
            maxLength={100}
            mt={'sm'}
          />
      </Popover.Target>
      <Popover.Dropdown>
        <Box maw={250}>
          {hintItem(rules.minLen, 'At least 10 characters')}
          {hintItem(rules.hasUpper, 'Contains uppercase letter')}
          {hintItem(rules.hasLower, 'Contains lowercase letter')}
          {hintItem(rules.hasNumber, 'Contains number')}
          {hintItem(rules.noSpaces, 'No spaces')}
          {hintItem(rules.passesAll, rules.strengthError ? rules.strengthError : 'Avoids common patterns')}
          {/*{rules.baseError && (
            <Text size="sm" c="yellow.7" mt="xs">{rules.baseError}</Text>
          )}*/}
        </Box>
      </Popover.Dropdown>
    </Popover>
  );
};

export default SCPasswordInput;
