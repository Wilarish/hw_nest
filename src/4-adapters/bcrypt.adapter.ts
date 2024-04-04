import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class BcryptAdapter {
  async passwordHash(
    password: string,
  ): Promise<{ passwordSalt; passwordHash }> {
    const passwordSalt: string = await bcrypt.genSalt(10);
    const passwordHash: string = await bcrypt.hash(password, passwordSalt);

    return {
      passwordSalt,
      passwordHash,
    };
  }

  async passwordHashWithoutSalt(
    password: string,
    salt: string,
  ): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}
