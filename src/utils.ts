import { createHmac } from "crypto";

export const parseMessage = (message: string) => ({
  crypto: message.match(/(?<=Сигнал:\n)(.*?)(?=\s\s[шорт|лонг])/)?.[0],
  sl: message.match(/(?<=Стоп - лосс : )(.*?)(?=\s)/)?.[0],
  ep: message.match(/(?<=Цена входа : ).*/)?.[0],
  tp1: message.match(/(?<=1 : ).*/)?.[0],
  tp2: message.match(/(?<=2 : ).*/)?.[0],
  tp3: message.match(/(?<=3 : ).*/)?.[0],
  tf: message.match(/(?<=(?<=лонг|шорт) )(.*?)(?= [🟩|🟥])/u)?.[0],
  side: message.match(/лонг/) ? "LONG" : "SHORT",
});

export const generateMessage = ({
  currency,
  sl,
  tp1,
  tp2,
  tp3,
  side,
  ep,
  tf,
}: {
  currency: string;
  sl: string;
  tp1: string;
  tp2: string;
  tp3: string;
  side: string;
  ep: string;
  tf: string;
}) => {
  const message = `
  ${side === "LONG" ? "🟢👆" : "🔴👇"}
  #${currency}
  #${side}
  #${tf}
  EP: ${ep}
  —————
  SL: ${sl}
  —————
  TP1: ${tp1}
  TP2: ${tp2}
  TP3: ${tp3}`;

  return message;
};

export const generateSignature = (str: string, key: string) =>
  createHmac("sha256", key).update(str).digest("hex");
