/**
 * KBank OpenAPI Sandbox Service
 * จัดการการขอ OAuth 2.0 Access Token และสร้าง Thai QR Code จาก KBank Sandbox
 */

interface KBankTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  errorCode?: string;
  errorDesc?: string;
}

interface KBankQRResponse {
  statusCode?: string;
  partnerTxnUid?: string;
  partnerId?: string;
  accountName?: string;
  qrCode?: string;
  errorCode?: string;
  errorDesc?: string;
}

// แคช Access Token ไว้ในหน่วยความจำเพื่อไม่ต้องยิงขอซ้ำทุกครั้งที่มีการสร้าง QR
let tokenCache: { token: string; expiresAt: number } | null = null;

/**
 * ขอ Access Token จาก KBank OpenAPI Sandbox (/v2/oauth/token)
 */
export async function getKBankAccessToken(): Promise<string | null> {
  const consumerId = process.env.KBANK_SANDBOX_CONSUMER_ID?.trim();
  const consumerSecret = process.env.KBANK_SANDBOX_CONSUMER_SECRET?.trim();

  if (!consumerId || !consumerSecret || consumerId.includes("ใส่_") || consumerSecret.includes("ใส่_")) {
    return null;
  }

  // ใช้ Token เดิมถ้ายังไม่หมดอายุ (เผื่อเวลาไว้ 60 วินาที)
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60000) {
    return tokenCache.token;
  }

  try {
    const authHeader = "Basic " + Buffer.from(`${consumerId}:${consumerSecret}`).toString("base64");
    const res = await fetch("https://openapi-sandbox.kasikornbank.com/v2/oauth/token", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
        "x-test-mode": "true",
        "env-id": "OAUTH2",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn("[KBank] OAuth request failed with status:", res.status);
      return null;
    }

    const data = (await res.json()) as KBankTokenResponse;
    if (data.access_token) {
      tokenCache = {
        token: data.access_token,
        expiresAt: Date.now() + (Number(data.expires_in) || 1799) * 1000,
      };
      return data.access_token;
    }
    return null;
  } catch (error) {
    console.warn("[KBank] OAuth error:", error);
    return null;
  }
}

/**
 * คำนวณ CRC16 (CCITT-FALSE) สำหรับมาตรฐาน EMVCo QR Code
 */
function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * สร้าง Fallback PromptPay Payload ตามมาตรฐาน EMVCo Tag 30 (Bill Payment / Biller ID)
 * ใช้ Biller ID สำหรับ KBank Sandbox เพื่อป้องกันไม่ให้โอนเงินจริงเข้าเบอร์โทรศัพท์ของบุคคลใด
 */
export function generateFallbackPromptPayPayload(amount: number, reference: string): string {
  const f = (tag: string, value: string) => `${tag}${value.length.toString().padStart(2, "0")}${value}`;
  const amountStr = amount.toFixed(2);

  // ใช้ Tag 30 (PromptPay Bill Payment) ของ KBank Sandbox
  // 00: AID สำหรับ Bill Payment (A000000677010112)
  // 01: KBank Sandbox Corporate Biller ID
  // 02: Reference 1 (Ref ที่สร้างจากระบบ)
  // 03: Reference 2 (SHOPCAM)
  const billerSub =
    f("00", "A000000677010112") +
    f("01", "010753600031500") +
    f("02", reference.slice(0, 20)) +
    f("03", "SHOPCAM");

  const payloadWithoutCrc =
    f("00", "01") + // Payload Format Indicator
    f("01", "12") + // Point of Initiation Method: Dynamic QR
    f("30", billerSub) + // Merchant Account Info (Bill Payment)
    f("53", "764") + // Transaction Currency (THB)
    f("54", amountStr) + // Transaction Amount
    f("58", "TH") + // Country Code
    "6304"; // CRC placeholder

  return payloadWithoutCrc + crc16(payloadWithoutCrc);
}

/**
 * ส่งคำขอสร้าง Thai QR Code ไปยัง KBank Sandbox (/v1/qrpayment/request)
 */
export async function createKBankQRCode(params: {
  amount: number;
  reference: string;
}): Promise<{ qrPayload: string; isRealKBankSandbox: boolean }> {
  const partnerId = process.env.KBANK_SANDBOX_PARTNER_ID?.trim() || "PTR1051673";
  const partnerSecret = process.env.KBANK_SANDBOX_PARTNER_SECRET?.trim() || "d4bded59200547bc85903574a293831b";
  const merchantId = process.env.KBANK_SANDBOX_MERCHANT_ID?.trim() || "KB102057149704";

  const token = await getKBankAccessToken();

  if (token) {
    try {
      // สร้าง Unique Partner Transaction ID (เช่น KBS98273612)
      const partnerTxnUid = ("KB" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)).toUpperCase().slice(0, 16);

      const requestBody = {
        partnerTxnUid,
        partnerId,
        partnerSecret,
        requestDt: new Date().toISOString(),
        merchantId,
        qrType: "3",
        txnAmount: Number(params.amount.toFixed(2)),
        txnCurrencyCode: "THB",
        reference1: params.reference.slice(0, 20),
        reference2: "SHOPCAM",
        reference3: "INV001",
        reference4: "INV001",
      };

      const res = await fetch("https://openapi-sandbox.kasikornbank.com/v1/qrpayment/request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "x-test-mode": "true",
          "env-id": "QR002",
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
      });

      if (res.ok) {
        const data = (await res.json()) as KBankQRResponse;
        if (data.qrCode) {
          return { qrPayload: data.qrCode, isRealKBankSandbox: true };
        }
      } else {
        console.warn("[KBank] QR generation failed status:", res.status, await res.text());
      }
    } catch (err) {
      console.warn("[KBank] QR generation error:", err);
    }
  }

  // Fallback: ใช้มาตรฐาน EMVCo PromptPay QR Code
  return {
    qrPayload: generateFallbackPromptPayPayload(params.amount, params.reference),
    isRealKBankSandbox: false,
  };
}
