import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  background: {
    resizeMode: "cover",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.35)",
  },

  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },

  logoContainer: {
    alignItems: "center",
    marginTop: 60,
  },

  logo: {
    width: 220,
    height: 360,
  },

  title: {
    marginTop: 12,
    fontSize: 42,
    fontFamily: "Alexandria-Bold",
    color: "#771616",
  },

  buttons: {
    gap: 16,
  },

  button: {
    height: 58,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  secondaryButton: {
    backgroundColor: "#FFFFFF",
  },

  primaryButton: {
    backgroundColor: "#771616",
  },

  secondaryText: {
    fontFamily: "Alexandria-Bold",
    fontSize: 20,
    color: "#000000",
  },

  primaryText: {
    fontFamily: "Alexandria-Bold",
    fontSize: 20,
    color: "#FFFFFF",
  },
});
