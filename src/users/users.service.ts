import { Injectable } from '@nestjs/common';

import { User } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      userId: 1,
      username: 'pruebasuno',
      password: 'Colombia2025*'
    },
    {
      userId: 2,
      username: 'pruebasdos',
      password: 'Bogota20_'
    },
    {
      userId: 3,
      username: 'pruebastres',
      password: 'Test25%'
    }
  ];

  findUser(username: string): User | undefined {
    return this.users.find((user) => user.username === username);
  }
}
