import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InMemoryStore, User } from '../common/in-memory.store';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private readonly store: InMemoryStore) {}

  register(payload: RegisterDto): User {
    const existing = this.store.users.find((u) => u.phone === payload.phone);
    if (existing) {
      throw new UnauthorizedException('User already exists');
    }
    return this.store.createUser(payload.phone, payload.password, payload.role);
  }

  findByPhone(phone: string): User | undefined {
    return this.store.users.find((u) => u.phone === phone);
  }

  login(payload: LoginDto): { token: string; user: User } {
    const user = this.store.users.find(
      (u) => u.phone === payload.phone && u.password === payload.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = Buffer.from(`${user.id}:${user.phone}:${user.role}`).toString('base64');
    return { token, user };
  }
}
