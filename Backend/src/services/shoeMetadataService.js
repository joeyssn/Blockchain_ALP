import { isDatabaseReady, query } from "../config/database.js";

const memory = {
  companies: [
    {
      id: 1,
      wallet_address: "0x9F1c4D2A8b3E5f678901234567890ABCdEf01234",
      company_name: "Nike Official",
      approved: true,
      created_at: "2026-05-21T08:00:00.000Z",
      updated_at: "2026-05-21T08:00:00.000Z",
    },
  ],
  shoes: [
    {
      id: 1,
      product_code: "NIKE001",
      brand: "Nike",
      model: "Air Jordan 1",
      release_year: 1985,
      company_wallet: "0x9F1c4D2A8b3E5f678901234567890ABCdEf01234",
      image_url: "",
      description: "Classic Nike Air Jordan 1 sample registered for authenticity verification.",
      specifications: JSON.stringify({
        colorway: "Chicago",
        material: "Leather",
        sizeRange: "US 7-13",
      }),
      created_at: "2026-05-21T08:00:00.000Z",
      updated_at: "2026-05-21T08:00:00.000Z",
    },
    {
      id: 2,
      product_code: "ADIDAS001",
      brand: "Adidas",
      model: "Samba OG",
      release_year: 1950,
      company_wallet: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      image_url: "",
      description: "Adidas Samba OG sample metadata stored off-chain.",
      specifications: JSON.stringify({
        colorway: "Black White Gum",
        material: "Leather and suede",
        category: "Lifestyle",
      }),
      created_at: "2026-05-22T08:00:00.000Z",
      updated_at: "2026-05-22T08:00:00.000Z",
    },
  ],
  activityLogs: [
    {
      id: 1,
      wallet_address: "0x9F1c4D2A8b3E5f678901234567890ABCdEf01234",
      action: "Shoe metadata seeded",
      product_code: "NIKE001",
      tx_hash: "",
      created_at: "2026-05-21T08:00:00.000Z",
    },
  ],
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function now() {
  return new Date().toISOString();
}

function normalizeBoolean(value) {
  return Boolean(value === true || value === 1);
}

export async function listCompanies() {
  if (!isDatabaseReady()) {
    return clone(memory.companies);
  }

  return query("SELECT * FROM companies ORDER BY created_at DESC");
}

export async function upsertCompany({ walletAddress, companyName, approved = true }) {
  if (!walletAddress || !companyName) {
    throw new Error("walletAddress and companyName are required");
  }

  if (!isDatabaseReady()) {
    const existing = memory.companies.find(
      (company) => company.wallet_address.toLowerCase() === walletAddress.toLowerCase()
    );

    if (existing) {
      existing.company_name = companyName;
      existing.approved = normalizeBoolean(approved);
      existing.updated_at = now();
      return clone(existing);
    }

    const company = {
      id: memory.companies.length + 1,
      wallet_address: walletAddress,
      company_name: companyName,
      approved: normalizeBoolean(approved),
      created_at: now(),
      updated_at: now(),
    };
    memory.companies.push(company);
    return clone(company);
  }

  await query(
    `INSERT INTO companies (wallet_address, company_name, approved)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE company_name = VALUES(company_name), approved = VALUES(approved)`,
    [walletAddress, companyName, approved ? 1 : 0]
  );

  return getCompany(walletAddress);
}

export async function getCompany(walletAddress) {
  if (!isDatabaseReady()) {
    return clone(
      memory.companies.find(
        (company) => company.wallet_address.toLowerCase() === walletAddress.toLowerCase()
      )
    );
  }

  const rows = await query("SELECT * FROM companies WHERE wallet_address = ? LIMIT 1", [
    walletAddress,
  ]);
  return rows[0] || null;
}

export async function listShoes() {
  if (!isDatabaseReady()) {
    return clone(memory.shoes);
  }

  return query("SELECT * FROM shoes ORDER BY created_at DESC");
}

export async function listCompanyShoes(walletAddress) {
  if (!isDatabaseReady()) {
    return clone(
      memory.shoes.filter(
        (shoe) => shoe.company_wallet.toLowerCase() === walletAddress.toLowerCase()
      )
    );
  }

  return query("SELECT * FROM shoes WHERE company_wallet = ? ORDER BY created_at DESC", [
    walletAddress,
  ]);
}

export async function getShoe(productCode) {
  if (!isDatabaseReady()) {
    return clone(
      memory.shoes.find(
        (shoe) => shoe.product_code.toLowerCase() === productCode.toLowerCase()
      )
    );
  }

  const rows = await query("SELECT * FROM shoes WHERE product_code = ? LIMIT 1", [
    productCode,
  ]);
  return rows[0] || null;
}

export async function upsertShoe(payload) {
  const {
    productCode,
    brand,
    model,
    releaseYear,
    companyWallet,
    imageUrl = "",
    description = "",
    specifications = {},
  } = payload;

  if (!productCode || !brand || !model || !companyWallet) {
    throw new Error("productCode, brand, model, and companyWallet are required");
  }

  const specificationsValue =
    typeof specifications === "string" ? specifications : JSON.stringify(specifications);

  if (!isDatabaseReady()) {
    const existing = memory.shoes.find(
      (shoe) => shoe.product_code.toLowerCase() === productCode.toLowerCase()
    );

    if (existing) {
      Object.assign(existing, {
        brand,
        model,
        release_year: Number(releaseYear || existing.release_year || 0),
        company_wallet: companyWallet,
        image_url: imageUrl,
        description,
        specifications: specificationsValue,
        updated_at: now(),
      });
      return clone(existing);
    }

    const shoe = {
      id: memory.shoes.length + 1,
      product_code: productCode,
      brand,
      model,
      release_year: Number(releaseYear || 0),
      company_wallet: companyWallet,
      image_url: imageUrl,
      description,
      specifications: specificationsValue,
      created_at: now(),
      updated_at: now(),
    };
    memory.shoes.push(shoe);
    return clone(shoe);
  }

  await query(
    `INSERT INTO shoes
      (product_code, brand, model, release_year, company_wallet, image_url, description, specifications)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      brand = VALUES(brand),
      model = VALUES(model),
      release_year = VALUES(release_year),
      company_wallet = VALUES(company_wallet),
      image_url = VALUES(image_url),
      description = VALUES(description),
      specifications = VALUES(specifications)`,
    [
      productCode,
      brand,
      model,
      Number(releaseYear || 0),
      companyWallet,
      imageUrl,
      description,
      specificationsValue,
    ]
  );

  return getShoe(productCode);
}

export async function listActivityLogs() {
  if (!isDatabaseReady()) {
    return clone(memory.activityLogs);
  }

  return query("SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100");
}

export async function createActivityLog({
  walletAddress = "",
  action,
  productCode = "",
  txHash = "",
}) {
  if (!action) {
    throw new Error("action is required");
  }

  if (!isDatabaseReady()) {
    const log = {
      id: memory.activityLogs.length + 1,
      wallet_address: walletAddress,
      action,
      product_code: productCode,
      tx_hash: txHash,
      created_at: now(),
    };
    memory.activityLogs.unshift(log);
    return clone(log);
  }

  await query(
    `INSERT INTO activity_logs (wallet_address, action, product_code, tx_hash)
     VALUES (?, ?, ?, ?)`,
    [walletAddress, action, productCode, txHash]
  );

  const rows = await query("SELECT * FROM activity_logs ORDER BY id DESC LIMIT 1");
  return rows[0];
}
