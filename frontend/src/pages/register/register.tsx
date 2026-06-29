import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import RegisterImage from "../../../assets/images/sign_up.png";

import { Input } from "../../shared/components";
import { useAuth } from "../../shared/contexts/authcontext";
import { RegisterFormData, registerSchema } from "../../shared/interfaces";
import { styles } from "./styles";
import { Ionicons } from "@expo/vector-icons";

export function RegisterScreen() {
  const navigation = useNavigation();

  const { signUp } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    const response = await signUp(data);

    if (response instanceof Error) {
      Alert.alert("Erro", response.message);
      return;
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </Pressable>

        <Image
          source={RegisterImage}
          resizeMode="contain"
          style={styles.image}
        />

        <Text style={styles.title}>Sign Up</Text>
        <Input
          control={control}
          name="name"
          label="Full Name"
          placeholder="John Doe"
          autoCapitalize="words"
        />

        <Input
          control={control}
          name="username"
          label="Username"
          placeholder="john_doe"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Input
          control={control}
          name="email"
          label="Email"
          placeholder="user.email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          control={control}
          name="password"
          label="Password"
          placeholder="********"
          secureTextEntry={!showPassword}
          rightIcon={
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#000"
            />
          }
          onRightIconPress={() => setShowPassword(!showPassword)}
        />

        <Pressable
          style={styles.button}
          disabled={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.buttonText}>Sign up</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
