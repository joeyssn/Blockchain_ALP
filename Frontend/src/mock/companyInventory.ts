export type CompanyInventory = {
  id: string;
  name: string;
};

export const totalMockUsers = 24;

export const companies: CompanyInventory[] = [
  { id: "nike", name: "Nike" },
  { id: "adidas", name: "Adidas" },
  { id: "puma", name: "Puma" },
];

export function findCompanyById(companyId?: string) {
  return companies.find((company) => company.id === companyId);
}

export function findCompanyByName(companyName?: string) {
  return companies.find(
    (company) => company.name.toLowerCase() === companyName?.trim().toLowerCase()
  );
}
