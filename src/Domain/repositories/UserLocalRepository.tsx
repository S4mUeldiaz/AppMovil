import { User } from "../entities/User";

export interface UserLocalRepository {
    save(user: User): void ;
    getUser(): Promise<User>;
    remove(): Promise<void>;
}