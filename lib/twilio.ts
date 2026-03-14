import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKeySid = process.env.TWILIO_API_KEY_SID;
const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;

export function generateVideoToken(roomName: string, identity: string) {
  if (!accountSid || !apiKeySid || !apiKeySecret) {
    throw new Error("Twilio credentials are not configured");
  }

  const AccessToken = twilio.jwt.AccessToken;
  const VideoGrant = AccessToken.VideoGrant;

  const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, {
    identity,
    ttl: 60 * 60,
  });

  token.addGrant(new VideoGrant({ room: roomName }));

  return token.toJwt();
}
