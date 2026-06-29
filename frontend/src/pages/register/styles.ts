import { StyleSheet } from "react-native";

import { colors, spacing } from "../../shared/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },

  back: {
    fontSize: 28,
    color: colors.black,
    marginBottom: spacing.md,
  },

  image: {
    width: "100%",
    height: 220,
  },

  social: {
    fontSize: 34,
  },

  title: {
    fontSize: 38,
    fontFamily: "Alexandria-Bold",
    color: colors.black,
    textAlign: "center",
  },

  button: {
    backgroundColor: colors.dangerDark,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: colors.white,
    fontSize: 24,
    fontFamily: "Alexandria-Bold",
  },
});
