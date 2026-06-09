export enum Role {
  USER = "USER",
  COMPANY = "COMPANY",
  ADMIN = "ADMIN",
}

const ADMIN_ADDRESS = "0xC095f05fB4b21C506BA9Ec2f0D22CA7a17A693CB";

const COMPANY_WALLETS: Record<string, string> = {
  "0xd8264294b27c43e5944a6932c7a27d885cb5c758": "Nike",
  "0x12ee27d5b5b5e74d2ad1cfd9020c943b9e121d03": "Adidas",
  "0x0c766c042abf07f93dcdd06e9d1637d817de7a63": "Puma",
};

function normalizeAddress(address?: string | null) {
  return address?.trim().toLowerCase() || "";
}

export function isValidWalletAddress(address?: string | null) {
  return /^0x[a-fA-F0-9]{40}$/.test(address?.trim() || "");
}

export function getRole(address?: string | null): Role {
  const normalizedAddress = normalizeAddress(address);

  if (!isValidWalletAddress(normalizedAddress)) {
    return Role.USER;
  }

  if (normalizedAddress === ADMIN_ADDRESS.toLowerCase()) {
    return Role.ADMIN;
  }

  if (normalizedAddress in COMPANY_WALLETS) {
    return Role.COMPANY;
  }

  return Role.USER;
}

export function getCompanyName(address?: string | null) {
  return COMPANY_WALLETS[normalizeAddress(address)] || "";
}

export function isAdmin(address?: string | null) {
  return getRole(address) === Role.ADMIN;
}

export function isCompany(address?: string | null) {
  return getRole(address) === Role.COMPANY;
}

export function isUser(address?: string | null) {
  return getRole(address) === Role.USER;
}

export const roleLabels: Record<Role, string> = {
  [Role.USER]: "User",
  [Role.COMPANY]: "Company",
  [Role.ADMIN]: "Admin",
};
