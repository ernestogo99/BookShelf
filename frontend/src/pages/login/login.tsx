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

import { Input } from "../../shared/components";
import { LoginFormData, loginSchema } from "../../shared/interfaces";
import { styles } from "./styles";

import LoginImage from "../../../assets/images/sign_in.png";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../shared/contexts/authcontext";

export function Login() {
  const navigation = useNavigation();

  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { signIn } = useAuth();

  async function onSubmit(data: LoginFormData) {
    const result = await signIn(data);

    if (result instanceof Error) {
      Alert.alert("Erro", result.message);
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
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </Pressable>

        <Image source={LoginImage} resizeMode="contain" style={styles.image} />

        <Text style={styles.title}>Sign In</Text>

        <Input
          control={control}
          name="email"
          label="Email"
          placeholder="Write your email"
          keyboardType="email-address"
          autoCapitalize="none"
          variant="danger"
        />

        <Input
          control={control}
          name="password"
          label="Password"
          placeholder="Write your password"
          secureTextEntry={!showPassword}
          variant="danger"
          rightIcon={
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#000"
            />
          }
          onRightIconPress={() => setShowPassword(!showPassword)}
        />

        <Pressable style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password ?</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          disabled={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.buttonText}>Sign in</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account ?</Text>

          <Pressable onPress={() => navigation.navigate("Register" as never)}>
            <Text style={styles.signUp}> Sign Up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
