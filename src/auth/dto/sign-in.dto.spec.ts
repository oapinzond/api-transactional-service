import { SignInDto } from './sign-in.dto';

describe('SignIn', () => {
  it('should be defined', () => {
    expect(new SignInDto()).toBeDefined();
  });
});
