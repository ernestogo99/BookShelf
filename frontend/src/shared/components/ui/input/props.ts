import { Control, FieldValues, Path } from "react-hook-form";
import {
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
  TextInputProps,
} from "react-native";

export type InputVariant = "primary" | "danger" | "light";

export interface BaseInputProps<T extends FieldValues> extends Omit<
  TextInputProps,
  "value" | "onChangeText"
> {
  control: Control<T>;
  name: Path<T>;

  label?: string;
  placeholder?: string;

  variant?: InputVariant;

  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  keyboardType?: KeyboardTypeOptions;

  returnKeyType?: ReturnKeyTypeOptions;
}
