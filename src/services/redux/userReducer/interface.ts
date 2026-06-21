interface UserReducerState {
  userData: UserDataResponse | undefined;
  isLogin: boolean;
  token: string;
}

// User Data

interface UserDataResponse {
  _id: string;
  email: string;
  phone: string;
  name: string;
  image: string;
  userId: string;
  loginType: string;
  googleId: null;
  status: string;
  kycStatus: string;
  riskLevel: string;
  device: null;
  lastLogin: string;
  bankAccount: BankAccount;
  referralCode: string;
  referredBy: null;
  resetToken: null;
  mfaEnabled: boolean;
  isPhoneVerify: boolean;
  isActive: boolean;
  isDeleted: boolean;
  kycRejectionReason: null;
  createdAt: string;
  updatedAt: string;
}

interface BankAccount {
  bank: null;
  accountNo: null;
  upi: null;
}

interface PorfolioDataRes {
  totalUsdValue: number;
  inrBalance: number;
  totalPortfolioValue: number;
  totalPnl: number;
  cryptoBalances: CryptoBalance[];
  recentTrades: RecentTrade[];
}

interface RecentTrade {
  _id: string;
  pair: string;
  side: string;
  orderType: string;
  price: number;
  quantity: number;
  total: number;
  status: string;
  createdAt: string;
  tradeId: string;
}

interface CryptoBalance {
  asset: string;
  balance: number;
  estimatedUsd: number;
  value: number;
}
