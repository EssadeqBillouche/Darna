export interface JwtPayload {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  isVerified: boolean;
  status: 'active' | 'suspended' | 'deleted';
}

declare global {
    namespace Express {
        export interface Request {
            user?: JwtPayload;
        }
    }
}