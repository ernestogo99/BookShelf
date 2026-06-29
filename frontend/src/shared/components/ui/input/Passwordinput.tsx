import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable } from "react-native";
import { FieldValues } from "react-hook-form";
import { BaseInput } from "./BaseInput";
import { colors } from "../../../theme";
import { BaseInputProps } from "./props";

export function PasswordInput<T extends FieldValues>(props: BaseInputProps<T>) {
  const [hidden, setHidden] = useState(true);

  return (
    <BaseInput
      secureTextEntry={hidden}
      rightIcon={
        <Pressable onPress={() => setHidden(!hidden)}>
          <Ionicons
            size={24}
            color={colors.black}
            name={hidden ? "eye-outline" : "eye-off-outline"}
          />
        </Pressable>
      }
      {...props}
    />
  );
}
