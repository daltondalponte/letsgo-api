-- AlterTable
ALTER TABLE "cupons" ADD COLUMN     "user_uid" TEXT;

-- AddForeignKey
ALTER TABLE "cupons" ADD CONSTRAINT "cupons_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "users"("uid") ON DELETE SET NULL ON UPDATE CASCADE;
