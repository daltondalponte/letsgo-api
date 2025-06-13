-- DropForeignKey
ALTER TABLE "refresh_token" DROP CONSTRAINT "refresh_token_useruid_fkey";

-- AddForeignKey
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_useruid_fkey" FOREIGN KEY ("useruid") REFERENCES "users"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
