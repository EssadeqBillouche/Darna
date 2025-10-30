import { CompanyRepository } from "../../persistence/repositories/CompanyRepository";
import { Company } from "../entities/Company";
import { CompanyProps } from "../types/Company";

export class CompanyService {
  private companyRepo: CompanyRepository;

  constructor(companyRepo: CompanyRepository) {
    this.companyRepo = companyRepo;
  }

  async createCompany(props: CompanyProps): Promise<Company> {
    try {
      const company = Company.create({
        ...props,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return this.companyRepo.create(company);
    } catch (error: any) {
      throw new Error(`Create Company Failed ${error.message}`);
    }
  }
}
