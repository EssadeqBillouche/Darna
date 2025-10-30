import { CompanyModel } from "../models/CompanyModel";
import { Company } from "../../business/entities/Company";

export class CompanyRepository {

  async create(company: Company): Promise<Company> {
    const saved = await CompanyModel.create(company.toJson());
    return new Company(saved.toObject());
  }
}
