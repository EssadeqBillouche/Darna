import { Request, Response } from "express";
import { CompanyService } from "../../business/services/CompanyService";

export class CompanyController {
    private companyService: CompanyService

    constructor(companyService: CompanyService) {
        this.companyService = companyService;
    }

    async create(req: Request, res: Response) {
        try {
            const company = await this.companyService.createCompany(req.body);
            res.status(201).json(company.toJson());
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }
}
