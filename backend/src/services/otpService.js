const crypto = require('crypto');
const Otp = require('../models/Otp');

/**
 * Modular SMS / OTP Delivery Providers
 */
class SmsProvider {
  /**
   * Send SMS to destination phone
   * @param {string} phone - E.164 formatted phone number (+91XXXXXXXXXX)
   * @param {string} otpCode - 6 digit OTP
   * @param {string} message - Text message content
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  async sendSms(phone, otpCode, message) {
    throw new Error('sendSms method must be implemented by the provider');
  }
}

/**
 * Fast2SMS Provider (Indian SMS Gateway)
 * https://www.fast2sms.com
 * Supports Indian mobile numbers with Quick or OTP routes
 */
class Fast2SmsProvider extends SmsProvider {
  async sendSms(phone, otpCode, message) {
    const apiKey = process.env.FAST2SMS_API_KEY;
    if (!apiKey) {
      console.error('[Fast2SMS] Missing FAST2SMS_API_KEY in environment variables.');
      return { success: false, error: 'SMS Gateway is not configured with FAST2SMS_API_KEY.' };
    }

    try {
      // Fast2SMS expects raw 10-digit number for Indian numbers
      const rawNumber = phone.replace(/^\+91/, '').trim();
      
      // Try Fast2SMS OTP route (route: 'otp' or 'q' quick SMS)
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otpCode,
          numbers: rawNumber,
        }),
      });

      const data = await response.json();
      if (data.return) {
        console.log(`[Fast2SMS] Real OTP SMS dispatched to ${phone}. Request ID: ${data.request_id}`);
        return { success: true, messageId: data.request_id };
      }

      // Fallback to quick route if OTP route failed
      const fallbackRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',
          message: message,
          language: 'english',
          flash: 0,
          numbers: rawNumber,
        }),
      });

      const fallbackData = await fallbackRes.json();
      if (fallbackData.return) {
        console.log(`[Fast2SMS] Real OTP SMS dispatched via fallback route to ${phone}. Request ID: ${fallbackData.request_id}`);
        return { success: true, messageId: fallbackData.request_id };
      }

      const errMsg = fallbackData.message?.[0] || data.message?.[0] || 'Fast2SMS dispatch failed';
      console.error('[Fast2SMS] Dispatch error:', errMsg);
      return { success: false, error: errMsg };
    } catch (err) {
      console.error('[Fast2SMS] Network/Gateway error:', err.message);
      return { success: false, error: err.message };
    }
  }
}

/**
 * Twilio SMS Provider
 * https://www.twilio.com
 * Global SMS Gateway
 */
class TwilioSmsProvider extends SmsProvider {
  async sendSms(phone, otpCode, message) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.error('[Twilio] Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER.');
      return { success: false, error: 'SMS Gateway is not configured with Twilio credentials.' };
    }

    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', phone);
      params.append('From', fromNumber);
      params.append('Body', message);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`[Twilio] Real OTP SMS sent to ${phone}. SID: ${data.sid}`);
        return { success: true, messageId: data.sid };
      }
      console.error('[Twilio] API error:', data.message);
      return { success: false, error: data.message };
    } catch (err) {
      console.error('[Twilio] Network error:', err.message);
      return { success: false, error: err.message };
    }
  }
}

/**
 * MSG91 SMS Provider (India)
 * https://msg91.com
 */
class Msg91SmsProvider extends SmsProvider {
  async sendSms(phone, otpCode, message) {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (!authKey) {
      console.error('[MSG91] Missing MSG91_AUTH_KEY.');
      return { success: false, error: 'SMS Gateway is not configured with MSG91_AUTH_KEY.' };
    }

    try {
      const rawNumber = phone.replace(/^\+/, '').trim();
      let url = `https://control.msg91.com/api/v5/otp?template_id=${templateId || ''}&mobile=${rawNumber}&authkey=${authKey}&otp=${otpCode}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.type === 'success' || response.ok) {
        console.log(`[MSG91] Real OTP SMS dispatched to ${phone}.`);
        return { success: true, messageId: data.message };
      }
      return { success: false, error: data.message || 'MSG91 failed' };
    } catch (err) {
      console.error('[MSG91] Network error:', err.message);
      return { success: false, error: err.message };
    }
  }
}

/**
 * 2Factor.in SMS Provider (India)
 * https://2factor.in
 */
class TwoFactorSmsProvider extends SmsProvider {
  async sendSms(phone, otpCode, message) {
    const apiKey = process.env.TWOFACTOR_API_KEY;

    if (!apiKey) {
      console.error('[2Factor] Missing TWOFACTOR_API_KEY.');
      return { success: false, error: 'SMS Gateway is not configured with TWOFACTOR_API_KEY.' };
    }

    try {
      const rawNumber = phone.replace(/^\+91/, '').trim();
      const url = `https://2factor.in/v5/API/V1/${apiKey}/SMS/${rawNumber}/${otpCode}/AUTOGEN`;

      const response = await fetch(url, { method: 'GET' });
      const data = await response.json();

      if (data.Status === 'Success') {
        console.log(`[2Factor] Real OTP SMS sent to ${phone}. Session ID: ${data.Details}`);
        return { success: true, messageId: data.Details };
      }
      return { success: false, error: data.Details || '2Factor dispatch failed' };
    } catch (err) {
      console.error('[2Factor] Network error:', err.message);
      return { success: false, error: err.message };
    }
  }
}

/**
 * Factory to instantiate configured SMS Provider
 */
function getSmsProvider() {
  const providerType = (process.env.SMS_PROVIDER || '').toLowerCase();
  
  if (providerType === 'twilio' || (!providerType && process.env.TWILIO_ACCOUNT_SID)) {
    return new TwilioSmsProvider();
  }
  if (providerType === 'msg91' || (!providerType && process.env.MSG91_AUTH_KEY)) {
    return new Msg91SmsProvider();
  }
  if (providerType === 'twofactor' || (!providerType && process.env.TWOFACTOR_API_KEY)) {
    return new TwoFactorSmsProvider();
  }
  if (providerType === 'fast2sms' || (!providerType && process.env.FAST2SMS_API_KEY)) {
    return new Fast2SmsProvider();
  }

  throw new Error(
    'SMS is not configured. Set SMS_PROVIDER to twilio, msg91, twofactor, or fast2sms and provide that provider\'s credentials.'
  );
}

/**
 * OTP Service with Rate Limiting, TTL & Real SMS Delivery
 */
class OtpService {
  constructor() {
    this.OTP_EXPIRATION_MINUTES = 5;
  }

  /**
   * Generates a cryptographically secure 6-digit numeric OTP code
   */
  generateNumericOtp() {
    // Generate secure random integer between 100000 and 999999
    return crypto.randomInt(100000, 1000000).toString();
  }

  /**
   * Format and standardize Indian phone number to +91XXXXXXXXXX
   */
  formatIndianPhone(inputPhone) {
    if (!inputPhone) return null;
    let clean = inputPhone.toString().trim().replace(/[\s\-\(\)]/g, '');
    if (clean.startsWith('+91')) {
      clean = clean.substring(3);
    } else if (clean.startsWith('91') && clean.length === 12) {
      clean = clean.substring(2);
    } else if (clean.startsWith('0')) {
      clean = clean.substring(1);
    }

    if (/^[6-9]\d{9}$/.test(clean)) {
      return `+91${clean}`;
    }
    return null;
  }

  /**
   * Create and send OTP to phone
   */
  async sendOtp(rawPhone) {
    const formattedPhone = this.formatIndianPhone(rawPhone);
    if (!formattedPhone) {
      throw new Error('Please provide a valid 10-digit Indian phone number (starting with 6, 7, 8, or 9)');
    }

    const otpCode = this.generateNumericOtp();
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRATION_MINUTES * 60 * 1000);

    // Deliver first: never create an OTP a user cannot receive. Test mode uses
    // an in-memory delivery result so automated checks never contact an SMS gateway.
    const smsMessage = `Your SevaAI citizen verification code is ${otpCode}. Valid for ${this.OTP_EXPIRATION_MINUTES} minutes. Please do not share this code with anyone.`;
    const sendResult = process.env.NODE_ENV === 'test'
      ? { success: true, messageId: 'test-otp' }
      : await getSmsProvider().sendSms(formattedPhone, otpCode, smsMessage);

    if (!sendResult.success) {
      throw new Error(sendResult.error || 'Unable to send OTP. Please try again later.');
    }

    // Only a one-way hash is retained; the raw code is never stored in MongoDB.
    const otpHash = crypto.createHash('sha256').update(otpCode).digest('hex');

    // A successful resend supersedes any previous code for the same number.
    await Otp.deleteMany({ phone: formattedPhone });

    // Save new OTP record in database with TTL
    await Otp.create({
      phone: formattedPhone,
      otpHash,
      expiresAt: expiresAt,
      attempts: 0,
    });

    return {
      success: true,
      phone: formattedPhone,
      expiresAt: expiresAt,
      expiresInSeconds: this.OTP_EXPIRATION_MINUTES * 60,
      message: 'OTP sent successfully to your mobile number via SMS',
      ...(process.env.NODE_ENV === 'test' ? { devOtp: otpCode } : {}),
    };
  }

  /**
   * Verify an entered OTP for a phone number
   */
  async verifyOtp(rawPhone, enteredOtp) {
    const formattedPhone = this.formatIndianPhone(rawPhone);
    if (!formattedPhone) {
      return { success: false, reason: 'INVALID_PHONE', message: 'Invalid Indian phone number format' };
    }

    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      return { success: false, reason: 'INVALID_FORMAT', message: 'Please enter a 6-digit OTP' };
    }

    const record = await Otp.findOne({ phone: formattedPhone });

    if (!record) {
      return {
        success: false,
        reason: 'EXPIRED_OR_NOT_FOUND',
        message: 'OTP has expired or was not requested. Please request a new code.',
      };
    }

    // Check expiration timestamp
    if (new Date() > new Date(record.expiresAt)) {
      await Otp.deleteOne({ _id: record._id });
      return {
        success: false,
        reason: 'EXPIRED',
        message: 'OTP has expired. Please request a new one.',
      };
    }

    // Check brute-force attempts
    if (record.attempts >= 5) {
      await Otp.deleteOne({ _id: record._id });
      return {
        success: false,
        reason: 'MAX_ATTEMPTS_EXCEEDED',
        message: 'Too many incorrect attempts. Please request a new OTP.',
      };
    }

    const enteredOtpHash = crypto.createHash('sha256').update(enteredOtp.trim()).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(record.otpHash), Buffer.from(enteredOtpHash))) {
      record.attempts += 1;
      await record.save();
      const remaining = 5 - record.attempts;
      return {
        success: false,
        reason: 'INVALID_OTP',
        message: `Incorrect OTP code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      };
    }

    // OTP is valid! Delete record so it cannot be reused
    await Otp.deleteOne({ _id: record._id });

    return {
      success: true,
      phone: formattedPhone,
      message: 'Phone number verified successfully',
    };
  }
}

module.exports = new OtpService();
