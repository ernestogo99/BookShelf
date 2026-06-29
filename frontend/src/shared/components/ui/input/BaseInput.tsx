import { Controller, FieldValues } from "react-hook-form";
import { Pressable, Text, TextInput, View } from "react-native";

import { styles } from "./styles";
import { colors } from "../../../theme";
import { BaseInputProps } from "./props";

const borderColor = {
  primary: colors.primary,
  danger: colors.accent,
  light: colors.white,
};

export function BaseInput<T extends FieldValues>({
  control,
  name,
  label,
  variant = "primary",
  leftIcon,
  rightIcon,
  style,
  multiline,
  onRightIconPress,
  ...rest
}: BaseInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View style={styles.container}>
          {label && <Text style={styles.label}>{label}</Text>}

          <View
            style={[
              styles.inputContainer,
              {
                borderColor: fieldState.error
                  ? colors.danger
                  : borderColor[variant],
              },
            ]}
          >
            {leftIcon}

            <TextInput
              value={field.value?.toString()}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              multiline={multiline}
              placeholderTextColor={colors.grayLight}
              style={[styles.input, multiline && styles.multiline, style]}
              {...rest}
            />

            {rightIcon && (
              <Pressable onPress={onRightIconPress} hitSlop={10}>
                {rightIcon}
              </Pressable>
            )}
          </View>

          {fieldState.error && (
            <Text style={styles.error}>{fieldState.error.message}</Text>
          )}
        </View>
      )}
    />
  );
}
