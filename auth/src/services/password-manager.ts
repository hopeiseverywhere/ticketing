import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
export class PasswordManager {
    static async toHash(password: string) {
         // Generate a random salt using 8 bytes of random data
        const salt = randomBytes(8).toString('hex');
        // Hash the password using scrypt with the generated salt and 64 iterations
        const buf = (await scryptAsync(password, salt, 64)) as Buffer;
        // Return the concatenated string of hashed password and salt
        return `${buf.toString('hex')}.${salt}`;
    }
    static async compare(storedPassword: string, suppliedPassword: string) {
         // Split the stored password into hashed password and salt
        const [hashedPassword, salt] = storedPassword.split('.');
        // Hash the supplied password with the stored salt and 64 iterations
        const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer; 
        // Compare the resulting hashed password with the stored hashed password
        return buf.toString('hex') === hashedPassword;
    }
}
