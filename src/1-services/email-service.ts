import { Injectable } from '@nestjs/common';
import { emailAdapter } from '../4-adapters/email.adapter';

@Injectable()
export class EmailServices {
  constructor(private emailAdapter: emailAdapter) {}
  async SendEmailForRegistration(email: string, confirmationCode: string) {
    const subject: string = 'Registration';

    const message: string = `<h1>Thanks for your registration</h1>
        <p>To finish registration please follow the link below:
            <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
        </p>`;
    return this.emailAdapter.SendEmail(email, subject, message);
  }
  async SendEmailForRefreshPassword(email: string, recoveryCode: string) {
    const subject: string = 'Refreshing password';

    const message: string = `<h1>Thanks for your registration</h1>
        <p>To finish registration please follow the link below:
            <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>refreshing password</a>
            <p>recoveryCode + ' ${recoveryCode}'</p>
        </p>`;
    return this.emailAdapter.SendEmail(email, subject, message);
  }
}
