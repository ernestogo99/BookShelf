import { StyleSheet } from "react-native";
import { spacing, typography, colors, radius } from "../../../theme";

export const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },

  label: {
    marginBottom: spacing.sm,
    fontFamily: typography.family.semiBold,
    fontSize: typography.size.md,
    color: colors.black,
  },

  inputContainer: {
    minHeight: 56,

    borderWidth: 1.5,

    borderRadius: radius.lg,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: spacing.lg,

    backgroundColor: colors.white,
  },

  input: {
    flex: 1,

    fontSize: typography.size.md,

    fontFamily: typography.family.medium,

    color: colors.black,
  },

  multiline: {
    minHeight: 120,

    textAlignVertical: "top",

    paddingTop: spacing.md,
  },

  error: {
    marginTop: spacing.xs,

    color: colors.danger,

    fontFamily: typography.family.medium,

    fontSize: typography.size.sm,
  },

  icon: {
    marginHorizontal: spacing.sm,
  },
});
