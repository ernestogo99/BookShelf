/**
 * Paleta inspirada no Letterboxd (tema escuro denso).
 * Única fonte de cores do app — nada de hex hardcoded fora daqui.
 */
export const colors = {
  // Fundos
  background: '#14181c', // fundo principal (spec)
  surface: '#1c2228', // cartões / superfícies elevadas
  surfaceVariant: '#2c3440', // chips, inputs, capas placeholder
  surfaceHigh: '#384452', // hover/realce

  // Linhas
  border: '#2c3440',
  divider: '#283038',

  // Texto
  text: '#ffffff',
  textSecondary: '#99aabb',
  textMuted: '#678',
  textOnAccent: '#14181c',

  // Acento (verde Letterboxd)
  primary: '#00e054',
  primaryDark: '#00b545',

  // Status de leitura (spec §0)
  wantToRead: '#40bcf4', // Quero ler — azul
  reading: '#ff8000', // Lendo — laranja
  read: '#00e054', // Lido — verde

  // Estrelas / nota
  star: '#00e054',
  starEmpty: '#456',

  // Feedback
  error: '#ff4757',
  success: '#00e054',
  warning: '#ff8000',

  // Utilidades
  overlay: 'rgba(0,0,0,0.6)',
  transparent: 'transparent',
} as const;

export type ColorName = keyof typeof colors;

/** Cor por status de leitura da API. */
export const statusColor = (status: 'want_to_read' | 'reading' | 'read'): string => {
  switch (status) {
    case 'want_to_read':
      return colors.wantToRead;
    case 'reading':
      return colors.reading;
    case 'read':
      return colors.read;
  }
};

/** Rótulo PT-BR por status de leitura da API. */
export const statusLabel = (status: 'want_to_read' | 'reading' | 'read'): string => {
  switch (status) {
    case 'want_to_read':
      return 'Quero ler';
    case 'reading':
      return 'Lendo';
    case 'read':
      return 'Lido';
  }
};
