import { Injectable, Logger } from '@nestjs/common';

interface DarajaConfig {
  consumerKey?: string;
  consumerSecret?: string;
  shortcode?: string;
  initiatorName?: string;
  securityCredential?: string;
  baseUrl?: string;
  b2cResultUrl?: string;
  b2cTimeoutUrl?: string;
  b2bResultUrl?: string;
  b2bTimeoutUrl?: string;
}

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);
  private readonly config: DarajaConfig = {
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    shortcode: process.env.MPESA_SHORTCODE,
    initiatorName: process.env.MPESA_INITIATOR,
    securityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
    baseUrl: process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke',
    b2cResultUrl: process.env.MPESA_B2C_RESULT_URL,
    b2cTimeoutUrl: process.env.MPESA_B2C_TIMEOUT_URL,
    b2bResultUrl: process.env.MPESA_B2B_RESULT_URL,
    b2bTimeoutUrl: process.env.MPESA_B2B_TIMEOUT_URL,
  };

  async getAccessToken(): Promise<string | null> {
    if (!this.config.consumerKey || !this.config.consumerSecret) {
      this.logger.warn('Missing M-Pesa credentials; skipping live token request.');
      return null;
    }

    const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64');
    const url = `${this.config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      this.logger.error(`Failed to get token: ${response.status} ${response.statusText}`);
      return null;
    }

    const json = await response.json();
    return json.access_token as string;
  }

  async sendB2C(payload: {
    amount: number;
    msisdn: string;
    remarks?: string;
    occasion?: string;
    reference: string;
  }): Promise<any> {
    const token = await this.getAccessToken();
    if (!token) return { message: 'Simulated B2C (no credentials configured)' };

    const url = `${this.config.baseUrl}/mpesa/b2c/v1/paymentrequest`;
    const body = {
      InitiatorName: this.config.initiatorName,
      SecurityCredential: this.config.securityCredential,
      CommandID: 'BusinessPayment',
      Amount: payload.amount,
      PartyA: this.config.shortcode,
      PartyB: payload.msisdn,
      Remarks: payload.remarks || 'Lipa Fare withdrawal',
      QueueTimeOutURL: this.config.b2cTimeoutUrl,
      ResultURL: this.config.b2cResultUrl,
      Occasion: payload.occasion || 'LipaFare',
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await response.json();
    return json;
  }

  async sendB2B(payload: {
    amount: number;
    accountReference: string;
    remarks?: string;
    destinationShortcode: string;
    reference: string;
  }): Promise<any> {
    const token = await this.getAccessToken();
    if (!token) return { message: 'Simulated B2B (no credentials configured)' };

    const url = `${this.config.baseUrl}/mpesa/b2b/v1/paymentrequest`;
    const body = {
      Initiator: this.config.initiatorName,
      SecurityCredential: this.config.securityCredential,
      CommandID: 'BusinessPayBill',
      SenderIdentifierType: '4',
      RecieverIdentifierType: '4',
      Amount: payload.amount,
      PartyA: this.config.shortcode,
      PartyB: payload.destinationShortcode,
      AccountReference: payload.accountReference,
      Remarks: payload.remarks || 'Vendor payment',
      QueueTimeOutURL: this.config.b2bTimeoutUrl,
      ResultURL: this.config.b2bResultUrl,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await response.json();
    return json;
  }
}
