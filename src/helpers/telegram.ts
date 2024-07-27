import * as crypto from 'crypto';
import fetch from 'node-fetch';

export function validateInitDataUnsafe(initDataUnsafe) {
  const initData = { ...initDataUnsafe };
  const hash = initData.hash;
  delete initData.hash;
  const dataToCheck = Object.keys(initData)
    .map((key) => {
      if (typeof initData[key] === 'object') {
        return `${key}=${JSON.stringify(initData[key])}`;
      }
      return `${key}=${initData[key]}`;
    })
    .sort()
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(process.env.TELEGRAM_BOT_KEY)
    .digest();
  const _hash = crypto
    .createHmac('sha256', secretKey)
    .update(dataToCheck)
    .digest('hex');
  return hash === _hash;
}

export function validateWebTgAuthData(data) {
  const verificationData = { ...data };
  delete verificationData.hash;

  const dataToCheck = Object.keys(verificationData)
    .map((key) => `${key}=${verificationData[key]}`)
    .sort()
    .join('\n');

  const secret = crypto
    .createHash('sha256')
    .update(process.env.TELEGRAM_BOT_KEY)
    .digest();
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(dataToCheck)
    .digest('hex');
  return hmac === data.hash;
}

export async function getUserProfilePhoto(userId) {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_KEY}/getUserProfilePhotos?user_id=${userId}&limit=1`,
    );
    const data = await response.json();

    if (data.ok && data.result.photos.length > 0) {
      const photoFileId = data.result.photos[0][0].file_id;

      const fileResponse = await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_KEY}/getFile?file_id=${photoFileId}`,
      );
      const fileData = await fileResponse.json();

      if (fileData.ok) {
        const filePath = fileData.result.file_path;
        const photoUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_KEY}/${filePath}`;
        return photoUrl;
      }
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}
