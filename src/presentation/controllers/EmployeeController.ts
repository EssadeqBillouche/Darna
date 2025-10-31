import { Request, Response } from "express";
import { EmployeeService } from "../../business/services/EmployeeService";

export class EmployeeController {
    private employeeService: EmployeeService
    constructor(employeeService: EmployeeService) {
        this.employeeService = employeeService;
     }

    
    public async createEmployee (req: Request, res: Response) {
        try {
            const companyId = req.params.companyId;
            const { firstName, lastName, phoneNumber, role } = req.body;

            const { employee, password } = await this.employeeService.createEmployee(
                {
                    firstName,
                    lastName,
                    phoneNumber,
                    role,
                },
                companyId
            );

            res.status(201).json({
                message: "Employee created successfully",
                employee: employee,
                password: password,
            });
        } catch (error: any) {
            console.error("Create Employee Failed:", error);
            res.status(500).json({
                message: "Failed to create employee",
                error: error.message || "Internal Server Error",
            });
        }
    };
}
