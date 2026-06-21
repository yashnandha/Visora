import {
  aadhaarOtpRegex,
  aadhaarRegex,
  accountNumberRegex,
  drivingLicenseRegex,
  emailRegex,
  ifscRegex,
  mobileRegex,
  otpRegex,
  panRegex,
  passportRegex,
  urlRegex,
  voterIdRegex,
} from '@utility/validation/stringValidation';

import validationMessage from '@utility/validation/validationMessage';
import * as Yup from 'yup';

const aadhaarNumberSchema = (fieldName: string) =>
  Yup.string()
    .required(validationMessage.isRequired.replace('{key}', fieldName))
    .length(
      12,
      validationMessage.validFiled.replace('{key}', fieldName),
    )
    .matches(
      aadhaarRegex,
      validationMessage.validFiled.replace('{key}', fieldName),
    );

const aadhaarOtpSchema = (fieldName: string) =>
  Yup.string()
    .required(validationMessage.isRequired.replace('{key}', fieldName))
    .length(
      6,
      validationMessage.validFiled.replace('{key}', fieldName),
    )
    .matches(
      aadhaarOtpRegex,
      validationMessage.validFiled.replace('{key}', fieldName),
    );

const emailSchema = (name: string) =>
  Yup.string()
    .required(validationMessage.emptyEmail)
    .matches(emailRegex, validationMessage.invalidEmail);

const nameSchema = (name: string) =>
  Yup.string()
    .required(validationMessage.isRequired.replace('{key}', name))
    .test(
      'not-only-spaces',
      validationMessage.onlySpaces.replace('{key}', name),
      value => !!value && value.trim().length > 0,
    )
    .test(
      'no-special-chars',
      validationMessage.noSpecialChars.replace('{key}', name),
      value => !!value && /^[A-Za-z ]+$/.test(value),
    );

const otpSchema = Yup.string()
  .required(validationMessage.isRequired.replace('{key}', 'OTP'))
  .matches(otpRegex, validationMessage.validFiled.replace('{key}', 'OTP'));

const customUrlSchema = (fieldName: string) =>
  Yup.string()
    .required(validationMessage.isRequired.replace('{key}', fieldName))
    .matches(
      urlRegex,
      validationMessage.validFiled.replace('{key}', fieldName),
    );

const mobileNumberSchema = (fieldName: string) =>
  Yup.string()
    .required(validationMessage.isRequired.replace('{key}', fieldName))
    .matches(
      mobileRegex,
      validationMessage.validFiled.replace('{key}', fieldName),
    );

const panNumberSchema = (fieldName: string) =>
  Yup.string()
    .required(validationMessage.isRequired.replace('{key}', fieldName))
    .length(
      10,
      validationMessage.validFiled.replace('{key}', fieldName),
    )
    .matches(
      panRegex,
      validationMessage.validFiled.replace('{key}', fieldName),
    );

const passwordSchema = (fieldName: string) =>
  Yup.string()
    .required(validationMessage.isRequired.replace('{key}', fieldName))
    .min(
      8,
      validationMessage.validFiled.replace(
        '{key}',
        `${fieldName} must be at least 8 characters`,
      ),
    )
    .matches(
      /[A-Z]/,
      validationMessage.validFiled.replace('{key}', 'uppercase letter'),
    )
    .matches(
      /[0-9!@#$%^&*]/,
      validationMessage.validFiled.replace('{key}', 'number or symbol'),
    );

const passportSchema = (fieldName: string) =>
  Yup.string()
    .required(validationMessage.isRequired.replace('{key}', fieldName))
    .matches(
      passportRegex,
      validationMessage.validFiled.replace('{key}', fieldName),
    );

const drivingLicenseSchema = (fieldName: string) =>
  Yup.string()
    .required(validationMessage.isRequired.replace('{key}', fieldName))
    .matches(
      drivingLicenseRegex,
      validationMessage.validFiled.replace('{key}', fieldName),
    );

const voterIdSchema = (fieldName: string) =>
  Yup.string()
    .required(validationMessage.isRequired.replace('{key}', fieldName))
    .matches(
      voterIdRegex,
      validationMessage.validFiled.replace('{key}', fieldName),
    );

const ifscSchema = (fieldName: string) =>
  Yup.string()
    .required(validationMessage.isRequired.replace('{key}', fieldName))
    .matches(
      ifscRegex,
      validationMessage.validFiled.replace('{key}', fieldName),
    );

const accountNumberSchema = (fieldName: string) =>
  Yup.string()
    .required(validationMessage.isRequired.replace('{key}', fieldName))
    .matches(
      accountNumberRegex,
      validationMessage.validFiled.replace('{key}', fieldName),
    );

const requiredStringSchema = (fieldName: string) =>
  Yup.string()
    .required(validationMessage.isRequired.replace('{key}', fieldName))
    .test(
      'not-only-spaces',
      validationMessage.onlySpaces.replace('{key}', fieldName),
      value => !!value && value.trim().length > 0,
    );

const emailOrMobileSchema = () =>
  Yup.string()
    .required('Email or mobile number is required')
    .test(
      'email-or-mobile',
      'Enter a valid email or 10-digit mobile number',
      value => !!value && (emailRegex.test(value) || mobileRegex.test(value)),
    );

export {
  aadhaarNumberSchema,
  aadhaarOtpSchema,
  accountNumberSchema,
  customUrlSchema,
  drivingLicenseSchema,
  emailOrMobileSchema,
  emailSchema,
  ifscSchema,
  mobileNumberSchema,
  nameSchema,
  otpSchema,
  panNumberSchema,
  passportSchema,
  passwordSchema,
  requiredStringSchema,
  voterIdSchema,
};
