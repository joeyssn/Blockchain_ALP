export type CompanyShoe = {
  id: string;
  name: string;
  model: string;
  verified: boolean;
};

export type CompanyInventory = {
  id: string;
  name: string;
  shoes: CompanyShoe[];
};

export const totalMockUsers = 24;

export const companies: CompanyInventory[] = [
  {
    id: "nike",
    name: "Nike",
    shoes: [
      { id: "air-force-1", name: "Air Force 1", model: "Low '07", verified: true },
      { id: "air-jordan-1", name: "Air Jordan 1", model: "Chicago", verified: true },
      { id: "dunk-low", name: "Dunk Low", model: "Panda", verified: true },
    ],
  },
  {
    id: "adidas",
    name: "Adidas",
    shoes: [
      { id: "samba", name: "Samba", model: "OG", verified: true },
      { id: "gazelle", name: "Gazelle", model: "Indoor", verified: true },
      { id: "ultraboost", name: "Ultraboost", model: "Light", verified: true },
    ],
  },
  {
    id: "puma",
    name: "Puma",
    shoes: [
      { id: "suede-classic", name: "Suede Classic", model: "Archive", verified: true },
      { id: "rs-x", name: "RS-X", model: "Reinvention", verified: true },
      { id: "future-rider", name: "Future Rider", model: "Play On", verified: false },
    ],
  },
];

export function findCompanyById(companyId?: string) {
  return companies.find((company) => company.id === companyId);
}

export function findCompanyByName(companyName?: string) {
  return companies.find(
    (company) => company.name.toLowerCase() === companyName?.trim().toLowerCase()
  );
}

export function getVerifiedShoeCount(company: CompanyInventory) {
  return company.shoes.filter((shoe) => shoe.verified).length;
}
