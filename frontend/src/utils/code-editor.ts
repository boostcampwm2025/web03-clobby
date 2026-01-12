export const colorFromClientId = (clientId: number) => {
  const hue = (clientId * 137.508) % 360; // golden angle
  return {
    cursor: `hsl(${hue}, 80%, 45%)`,
    lineBg: `hsla(${hue}, 80%, 45%, 0.15)`,
  };
};

const injectedUserStyles = new Set<number>();

export const injectCursorStyles = (
  clientId: number,
  cursorColor: string,
  lineBg: string,
) => {
  if (injectedUserStyles.has(clientId)) return;

  injectedUserStyles.add(clientId);

  const style = document.createElement('style');
  style.dataset.clientId = String(clientId);

  style.textContent = `
    .remote-cursor-${clientId} {
      border-left: 2px solid ${cursorColor};
      margin-left: -1px;
    }

    .remote-line-${clientId} {
      background-color: ${lineBg};
    }
  `;

  document.head.appendChild(style);
};
