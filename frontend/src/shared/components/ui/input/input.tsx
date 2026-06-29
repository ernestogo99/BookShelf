import { FieldValues } from "react-hook-form";

import { BaseInput } from "./BaseInput";
import { BaseInputProps } from "./props";

export function Input<T extends FieldValues>(props: BaseInputProps<T>) {
  return <BaseInput {...props} />;
}
