import { View } from "react-native";
import { Input } from "../../shared/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoginFormData, loginSchema } from "../../shared/interfaces";

export const Login = () => {
  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <View>
      <Input
        control={control}
        name="email"
        label="Email"
        placeholder="Write your email"
        keyboardType="email-address"
        autoCapitalize="none"
        variant="danger"
      />
    </View>
  );
};
