import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },

  backText: {
    fontSize: 28,
  },

  image: {
    width: "100%",
    height: 200,
    alignSelf: "center",
  },

  title: {
    fontSize: 36,
    fontFamily: "Alexandria-Bold",
    alignSelf: "center",

    color: "#000",
  },

  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 8,
    marginBottom: 32,
  },

  forgotPasswordText: {
    fontSize: 15,
    color: "#000",
    fontFamily: "Alexandria-Regular",
  },

  button: {
    height: 58,
    borderRadius: 30,
    backgroundColor: "#407BFF",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontSize: 30,
    fontFamily: "Alexandria-Bold",
  },

  footer: {
    marginTop: 28,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  footerText: {
    fontFamily: "Alexandria-Bold",
    fontSize: 16,
  },

  signUp: {
    color: "#771616",
    fontFamily: "Alexandria-Bold",
    fontSize: 16,
  },
});
