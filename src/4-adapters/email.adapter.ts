import nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
@Injectable()
export class emailAdapter {
  async SendEmail(email: string, subject: string, message: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'testforapimail@gmail.com',
        pass: 'wwczrbikczzubiyt',
      },
    });

    const info = await transporter.sendMail({
      from: 'Nikita<testforapimail@gmail.com>', // sender address
      to: email, // list of receivers
      subject: subject, // Subject line
      text: 'Hello world?', // plain text body
      html: message, // html body
    });
  }
}
