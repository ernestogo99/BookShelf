module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // O plugin de worklets (Reanimated 4) DEVE ser o último da lista.
    // Necessário para react-native-reanimated / react-native-draggable-flatlist.
    plugins: ['react-native-worklets/plugin'],
  };
};
