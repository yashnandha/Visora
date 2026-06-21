const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const mobileRegex = /^[6-9]\d{9}$/i;
const otpRegex = /^[0-9]{4}$/;
const urlRegex =
  /^(https?:\/\/)?(www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\.[a-z]{2,})?(?::\d+)?(\/[^\s]*)?$/i;

const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;
const aadhaarOtpRegex = /^[0-9]{6}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const stringRegex = /^[a-zA-Z]+([a-zA-Z]+)*$/;
const usernameRegex = /^[a-zA-Z0-9._]+$/;
const gstinRegex =
  /^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const passportRegex = /^[A-Z]{1}[0-9]{7}$/;
const drivingLicenseRegex = /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/;
const voterIdRegex = /^[A-Z]{3}[0-9]{7}$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const accountNumberRegex = /^[0-9]{9,18}$/;

export {
  aadhaarOtpRegex,
  aadhaarRegex,
  accountNumberRegex,
  drivingLicenseRegex,
  emailRegex,
  gstinRegex,
  ifscRegex,
  mobileRegex,
  otpRegex,
  panRegex,
  passportRegex,
  stringRegex,
  urlRegex,
  usernameRegex,
  voterIdRegex,
};
