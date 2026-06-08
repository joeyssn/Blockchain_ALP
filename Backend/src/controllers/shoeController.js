import {
  createActivityLog,
  getCompany,
  getShoe,
  listActivityLogs,
  listCompanies,
  listCompanyShoes,
  listShoes,
  upsertCompany,
  upsertShoe,
} from "../services/shoeMetadataService.js";

function sendData(res, data, status = 200) {
  res.status(status).json({ data });
}

export async function getCompanies(req, res, next) {
  try {
    sendData(res, await listCompanies());
  } catch (error) {
    next(error);
  }
}

export async function saveCompany(req, res, next) {
  try {
    const company = await upsertCompany(req.body);
    await createActivityLog({
      walletAddress: req.body.walletAddress,
      action: "Company metadata saved",
    });
    sendData(res, company, 201);
  } catch (error) {
    next(error);
  }
}

export async function getCompanyByWallet(req, res, next) {
  try {
    const company = await getCompany(req.params.walletAddress);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    sendData(res, company);
  } catch (error) {
    next(error);
  }
}

export async function getShoes(req, res, next) {
  try {
    sendData(res, await listShoes());
  } catch (error) {
    next(error);
  }
}

export async function getShoesByCompany(req, res, next) {
  try {
    sendData(res, await listCompanyShoes(req.params.walletAddress));
  } catch (error) {
    next(error);
  }
}

export async function saveShoe(req, res, next) {
  try {
    const shoe = await upsertShoe(req.body);
    await createActivityLog({
      walletAddress: req.body.companyWallet,
      action: "Shoe metadata saved",
      productCode: req.body.productCode,
      txHash: req.body.txHash || "",
    });
    sendData(res, shoe, 201);
  } catch (error) {
    next(error);
  }
}

export async function getShoeByCode(req, res, next) {
  try {
    const shoe = await getShoe(req.params.productCode);

    if (!shoe) {
      return res.status(404).json({ message: "Shoe metadata not found" });
    }

    sendData(res, shoe);
  } catch (error) {
    next(error);
  }
}

export async function getVerificationMetadata(req, res, next) {
  try {
    const shoe = await getShoe(req.params.productCode);

    sendData(res, {
      productCode: req.params.productCode,
      metadataFound: Boolean(shoe),
      shoe: shoe || null,
    });
  } catch (error) {
    next(error);
  }
}

export async function getActivityLogs(req, res, next) {
  try {
    sendData(res, await listActivityLogs());
  } catch (error) {
    next(error);
  }
}

export async function saveActivityLog(req, res, next) {
  try {
    sendData(res, await createActivityLog(req.body), 201);
  } catch (error) {
    next(error);
  }
}
