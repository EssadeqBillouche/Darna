import { CompanyModel } from "../models/CompanyModel";
import { Company } from "../../business/entities/Company";
import { CompanyProps } from "../../business/types/Company";

export class CompanyRepository {

  async create(company: Company): Promise<Company> {
    const saved = await CompanyModel.create(company.toJson());
    return new Company(saved.toObject() as CompanyProps);
  }

  async findById(id: string): Promise<Company | null> {
    const getCompany = await CompanyModel.findById(id).populate("managerId employees");
    return getCompany ? new Company(getCompany.toObject() as CompanyProps) : null;
  }
}
