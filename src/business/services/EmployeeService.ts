import { CompanyRepository } from "../../persistence/repositories/CompanyRepository";
import { EmployeeRepository } from "../../persistence/repositories/EmpolyeeRepository";
import { UserRole } from "../enums/Role";
import { Company } from "../entities/Company";
import { User } from "../entities/User";
import { randomBytes } from "crypto";
import { UserProps } from "../types/User";

export class EmployeeService {
    constructor(
        private readonly employeeRepo: EmployeeRepository,
        private readonly companyRepo: CompanyRepository
    ) { }

    async createEmployee(data:
        {
            firstName: string;
            lastName: string;
            phoneNumber: string;
            role?: UserRole
        }, companyId: string): Promise<{ employee: User, password: string }> 
    {
        // Find company
        const company = await this.companyRepo.findById(companyId);
        if (!company) throw new Error("Company not found");

        // Generate email & password
        const companyName = company.name.toLowerCase().replace(/\s+/g, '');
        const email = `${data.firstName.toLowerCase()}_${data.lastName.toLowerCase()}@${companyName}.com`;
        const password = randomBytes(6).toString("hex");

        // Build employee props
        const employeeProps: UserProps = {
            firstName: data.firstName,
            lastName: data.lastName,
            email,
            phoneNumber: data.phoneNumber,
            password,
            role: data.role ?? UserRole.Employee,
            isVerified: true,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        
        // Create employee entity
        const employee = await User.create(employeeProps);
        const savedEmployee = await this.employeeRepo.create(employee);
        
        if (!savedEmployee.id) throw new Error("Employee id is not defined");
        await this.companyRepo.addEmployee(companyId, savedEmployee.id);

        return { employee: savedEmployee, password }
    }
}
