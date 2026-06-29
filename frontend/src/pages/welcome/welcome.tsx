import { ImageBackground, View, Text, Pressable, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { styles } from "./styles";
import LoginImage from "../../../assets/images/login_selection.jpg";
import logo from "../../../assets/svgs/BookShelfLogo.png";
export function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={LoginImage}
      style={styles.container}
      imageStyle={styles.background}
    >
      <View style={styles.overlay} />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} />

          <Text style={styles.title}>bookshelf</Text>
        </View>

        <View style={styles.buttons}>
          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate("Register" as never)}
          >
            <Text style={styles.secondaryText}>Join bookshelf</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate("Login" as never)}
          >
            <Text style={styles.primaryText}>Sign in</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}
