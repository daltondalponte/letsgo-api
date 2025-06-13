import { Module } from '@nestjs/common';
import { DataBaseModule } from '@infra/database/database.module'; // Assuming UserRepository is provided here
import { CreateUser } from './use-cases/create-user';
import { FindUserByEmail } from './use-cases/find-user-by-email';
import { FindUserById } from './use-cases/find-user-by-id';
// Import other user use cases as needed

@Module({
  imports: [DataBaseModule], // Import modules providing dependencies (like UserRepository)
  providers: [
    // List all use cases related to User
    CreateUser,
    FindUserByEmail,
    FindUserById,
    // Add other use cases like UpdateUser, DeleteUserById, etc.
  ],
  exports: [
    // Export use cases needed by other modules (like AuthModule)
    CreateUser,
    FindUserByEmail,
    FindUserById,
    // Export other use cases if needed
  ],
})
export class UserApplicationModule {}

