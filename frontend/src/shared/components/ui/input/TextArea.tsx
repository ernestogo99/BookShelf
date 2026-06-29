import { FieldValues } from "react-hook-form";

import { BaseInput } from "./BaseInput";
import { BaseInputProps } from "./props";

export function TextArea<T extends FieldValues>(props: BaseInputProps<T>) {
  return <BaseInput multiline numberOfLines={5} {...props} />;
}
