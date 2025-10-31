import { CompanyModel } from "../models/CompanyModel";
import { Company } from "../../business/entities/Company";
import { CompanyProps } from "../../business/types/Company";

export class CompanyRepository {

  async create(company: Company): Promise<Company> {
    const saved = await CompanyModel.create(company.toJson());
    return new Company(saved.toObject() as CompanyProps);
  }

  async addEmployee(companyId: string, employeeId: string): Promise<Company> {
    if(!employeeId) throw new Error('user id is not found')
    
    const updated = await CompanyModel.findByIdAndUpdate(
      companyId,
      { $push: { employees: employeeId } },
      { new: true },
    );

    if(!updated) throw new Error('The user was not added to the company.')
    return new Company(updated.toObject() as CompanyProps)
  }

  async findById(id: string): Promise<Company | null> {
    const getCompany = await CompanyModel.findById(id).populate("managerId");
    return getCompany ? new Company(getCompany.toObject() as CompanyProps) : null;
  }
}
