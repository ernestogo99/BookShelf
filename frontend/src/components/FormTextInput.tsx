import React, { useState } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';
import type { KeyboardTypeOptions } from 'react-native';

import { colors } from '@/theme';

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  error?: string;
  secure?: boolean;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: KeyboardTypeOptions;
  /** Contador "n/max" no canto inferior. */
  maxLength?: number;
  /** Valor atual (para o contador). */
  currentLength?: number;
};

/** Campo de formulário integrado ao react-hook-form (Paper TextInput + erro). */
export function FormTextInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  error,
  secure = false,
  multiline = false,
  autoCapitalize = 'sentences',
  keyboardType,
  maxLength,
  currentLength,
}: Props<T>) {
  const [hidden, setHidden] = useState(secure);

  return (
    <View style={styles.wrap}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            mode="outlined"
            label={label}
            placeholder={placeholder}
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!error}
            secureTextEntry={hidden}
            multiline={multiline}
            autoCapitalize={autoCapitalize}
            autoCorrect={!secure}
            keyboardType={keyboardType}
            maxLength={maxLength}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            style={styles.input}
            right={
              secure ? (
                <TextInput.Icon
                  icon={hidden ? 'eye' : 'eye-off'}
                  onPress={() => setHidden((h) => !h)}
                  forceTextInputFocus={false}
                />
              ) : undefined
            }
          />
        )}
      />
      <View style={styles.footer}>
        <HelperText type="error" visible={!!error} style={styles.helper}>
          {error ?? ' '}
        </HelperText>
        {maxLength !== undefined ? (
          <HelperText type="info" visible style={styles.counter}>
            {(currentLength ?? 0)}/{maxLength}
          </HelperText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 2,
  },
  input: {
    backgroundColor: colors.surface,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helper: {
    flexShrink: 1,
  },
  counter: {
    color: colors.textMuted,
  },
});
