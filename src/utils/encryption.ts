import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secretKey = process.env.ENCRYPTION_KEY || 'your-32-char-secret-key';
const iv = crypto.randomBytes(16); // Vecteur d'initialisation

// 🔒 Fonction de chiffrement
export function encrypt(text: string): string {
  const key = crypto.scryptSync(secretKey, 'salt', 32); // Génère une clé de 32 octets
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted; // Stocke IV et message chiffré
}

// 🔓 Fonction de déchiffrement
export function decrypt(encryptedText: string): string {
  const key = crypto.scryptSync(secretKey, 'salt', 32);
  const [ivHex, encryptedData] = encryptedText.split(':');

  if (!ivHex || !encryptedData) {
    throw new Error('Invalid encrypted text format');
  }

  const ivBuffer = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
