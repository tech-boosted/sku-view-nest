export interface CreateUserDTO {
  firstname: string;
  lastname: string;
  company: string;
  phone_number: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}
