import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class BcryptAdapter {
  async passwordHash(
    password: string,
  ): Promise<{ passwordSalt; passwordHash }> {
    //const password: string = process.env.PASSWORD_HASH_KEY || '12345';

    const passwordSalt: string = await bcrypt.genSalt(10);
    const passwordHash: string = await bcrypt.hash(password, passwordSalt);

    return {
      passwordSalt,
      passwordHash,
    };
  }
}
